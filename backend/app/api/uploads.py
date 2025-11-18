from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse

'''
File upload endpoints,for uploading images, 
static files should be served by the ASGI/static middleware or reverse proxy
'''

router = APIRouter(prefix="/uploads", tags=["uploads"])
UPLOAD_DIR = Path("static/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("", summary="Upload a file; returns public URL")
async def upload_file(file: UploadFile = File(...)):
    suffix = Path(file.filename).suffix or ""
    if suffix.lower() not in {".png", ".jpg", ".jpeg", ".webp", ".gif"}:
        raise HTTPException(400, "unsupported file type")
    import uuid
    name = f"{uuid.uuid4().hex}{suffix.lower()}"
    dest = UPLOAD_DIR / name
    with dest.open("wb") as f:
        f.write(await file.read())
    return JSONResponse({"url": f"/static/uploads/{name}"})