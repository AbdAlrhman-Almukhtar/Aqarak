from typing import List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
import os
from app.db.session import get_db
from app.db.models import Doc, DocChunk
from app.deps import get_current_user
try:
    import openai 
    openai.api_key = os.getenv("OPENAI_API_KEY", "")
except Exception:
    openai = None

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
    if not openai or not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(500, "embeddings backend not configured")
    resp = openai.Embedding.create(
        model=os.getenv("EMBED_MODEL", "text-embedding-3-small"),
        input=chunks,
    )
    return [d["embedding"] for d in resp["data"]]

@router.post("", status_code=201)
def upload(doc: DocIn, db: Session = Depends(get_db), _=Depends(get_current_user)):
    chunks = _split(doc.text)
    if not chunks:
        raise HTTPException(400, "empty document")
    embs = embed_many(chunks)

    d = Doc(title=doc.title)
    db.add(d); db.flush()  # get id
    rows = [
        DocChunk(doc_id=d.id, ord=i, content=c, embedding=embs[i])
        for i, c in enumerate(chunks)
    ]
    db.add_all(rows)
    db.commit()
    return {"doc_id": d.id, "chunks": len(rows)}