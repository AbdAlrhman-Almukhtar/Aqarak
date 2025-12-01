from typing import List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
import os
from app.db.session import get_db
from app.db.models import Doc, DocChunk
from app.deps import get_current_user
try:
    from openai import OpenAI
except ImportError:
    OpenAI = None

router = APIRouter(prefix="/docs", tags=["docs"])

class DocIn(BaseModel):
    title: str
    text: str

def _split(text: str, max_len: int = 900):
    parts, buf = [], []
    count = 0
    for para in text.split("\n"):
        if count + len(para) > max_len and buf:
            parts.append("\n".join(buf)); buf, count = [], 0
        if para.strip():
            buf.append(para); count += len(para)
    if buf: parts.append("\n".join(buf))
    return parts

def embed_many(chunks: List[str]) -> List[List[float]]:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(500, "embeddings backend not configured")
    
    client = OpenAI(api_key=api_key)
    try:
        resp = client.embeddings.create(
            model=os.getenv("EMBED_MODEL", "text-embedding-3-small"),
            input=chunks,
        )
        return [d.embedding for d in resp.data]
    except Exception as e:
        print(f"Embedding error: {e}")
        raise HTTPException(500, f"Embedding failed: {e}")

@router.post("", status_code=201)
def upload(doc: DocIn, db: Session = Depends(get_db), _=Depends(get_current_user)):
    chunks = _split(doc.text)
    if not chunks:
        raise HTTPException(400, "empty document")
    embs = embed_many(chunks)

    d = Doc(title=doc.title)
    db.add(d); db.flush()
    rows = [
        DocChunk(doc_id=d.id, ord=i, content=c, embedding=embs[i])
        for i, c in enumerate(chunks)
    ]
    db.add_all(rows)
    db.commit()
    return {"doc_id": d.id, "chunks": len(rows)}