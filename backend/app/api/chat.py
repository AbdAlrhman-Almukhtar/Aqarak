from typing import Optional
import os
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import text, func, or_
from sqlalchemy.orm import Session
from fastapi_limiter.depends import RateLimiter
from openai import OpenAI, RateLimitError
from app.db.session import get_db
from app.deps import get_current_user
from app.db.models import Property

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
    try:
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
    except Exception as e:
        print(f"Vector search failed (top_k_context): {e}")
        db.rollback()
        return ""

def search_properties_context(db: Session, query: str, limit: int = 3) -> str:
    """
    Simple keyword search for properties to include in context.
    """
    terms = query.split()
    if not terms:
        return ""
    
    filters = []
    for term in terms:
        term_filter = f"%{term}%"
        filters.append(Property.title.ilike(term_filter))
        filters.append(Property.city.ilike(term_filter))
        filters.append(Property.neighborhood.ilike(term_filter))
        filters.append(Property.description.ilike(term_filter))
    
    props = db.query(Property).filter(
        Property.is_active.is_(True),
        or_(*filters)
    ).limit(limit).all()

    if not props:
        return ""

    context_parts = ["Found these relevant properties in our database:"]
    for p in props:
        price_str = f"{p.price:,.0f} JOD" if p.price else "N/A"
        if p.is_for_rent:
            price_str = f"{p.rent_price:,.0f} JOD/mo"
        
        context_parts.append(
            f"- ID {p.id}: {p.title} in {p.city}, {p.neighborhood}. "
            f"Price: {price_str}. "
            f"{p.bedrooms} beds, {p.bathrooms} baths, {p.area_sqm} sqm. "
            f"Type: {p.property_type}."
        )
    
    return "\n".join(context_parts)

@router.post("", response_model=ChatOut)
def chat(payload: ChatIn, db: Session = Depends(get_db), _=Depends(get_current_user)):
    if not os.getenv("OPENAI_API_KEY"):
        return ChatOut(answer="I'm sorry, but I cannot process your request right now because the AI service is not configured (missing API Key).")
        
    try:
        docs_ctx = top_k_context(db, payload.question, k=3)
        
        props_ctx = search_properties_context(db, payload.question, limit=3)
        
        system = (
            "You are Aqarak AI, a premium real estate concierge for Jordan. "
            "Your tone is professional, sophisticated, yet warm and helpful. "
            "Format your responses beautifully using bullet points for lists and bold headers for sections. "
            "Be concise but thorough. When answering about laws, use clear numbered steps. "
            "Use the provided context to offer expert advice. "
            "If referring to specific properties, highlight their key selling points. "
            "Always reply in the same language as the user (English or Arabic)."
        )
        
        if payload.mode == "legal":
            system += f" Focus on legal aspects. Jurisdiction: {payload.jurisdiction or 'Jordan'}."

        context_str = ""
        if props_ctx:
            context_str += f"\n\n=== Relevant Properties ===\n{props_ctx}"
        if docs_ctx:
            context_str += f"\n\n=== Legal Documents ===\n{docs_ctx}"
            
        user_prompt = payload.question
        if context_str:
            user_prompt += f"\n\n---\nContext:{context_str}"

        completion = client.chat.completions.create(
            model=os.getenv("CHAT_MODEL", "gpt-3.5-turbo"),
            temperature=0.3,
            messages=[{"role":"system","content":system},{"role":"user","content":user_prompt}],
        )
        answer = completion.choices[0].message.content.strip()
        return ChatOut(answer=answer)
    except RateLimitError as e:
        db.rollback()
        raise HTTPException(status_code=503, detail="LLM quota exceeded")
    except Exception as e:
        db.rollback()
        print(f"Chat Error: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred while processing your request.")