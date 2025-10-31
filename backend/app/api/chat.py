from typing import Optional
import os
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session
from fastapi_limiter.depends import RateLimiter
from openai import OpenAI, RateLimitError
from app.db.session import get_db
from app.deps import get_current_user

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

router = APIRouter(prefix="/chat", tags=["chat"])

class ChatIn(BaseModel):
    question: str
    mode: Optional[str] = None
    jurisdiction: Optional[str] = None

class ChatOut(BaseModel):
    answer: str

def top_k_context(db: Session, query: str, k: int = 5) -> str:
    if not os.getenv("OPENAI_API_KEY"):
        return ""
    emb = client.embeddings.create(
        model=os.getenv("EMBED_MODEL", "text-embedding-3-small"),
        input=query,
    ).data[0].embedding

    emb_str = "[" + ",".join(str(x) for x in emb) + "]"

    rows = db.execute(
        text("""
            SELECT content
            FROM doc_chunks
            ORDER BY embedding <=> (:q::vector)
            LIMIT :k
        """),
        {"q": emb_str, "k": k},
    ).fetchall()
    return "\n\n".join(r[0] for r in rows)

@router.post("", response_model=ChatOut)
def chat(payload: ChatIn, db: Session = Depends(get_db), _=Depends(get_current_user)):
    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY not configured")
    try:
        ctx = top_k_context(db, payload.question, k=5)
        system = "You are concise. Cite only from provided context. If unsure, say you don't know."
        if payload.mode == "legal":
            system = (
                "You are a legal information assistant, not a lawyer. "
                "Answer using the provided context only; if outside, say you don't know. "
                f"Jurisdiction: {payload.jurisdiction or 'unspecified'}."
            )
        user_prompt = payload.question if not ctx else f"{payload.question}\n\n---\nContext:\n{ctx}"
        completion = client.chat.completions.create(
            model=os.getenv("CHAT_MODEL", "gpt-4o-mini"),
            temperature=0.2,
            messages=[{"role":"system","content":system},{"role":"user","content":user_prompt}],
        )
        answer = completion.choices[0].message.content.strip()
        return ChatOut(answer=answer)
    except RateLimitError as e:
        raise HTTPException(status_code=503, detail="LLM quota exceeded")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"chat_error: {type(e).__name__}: {e}")