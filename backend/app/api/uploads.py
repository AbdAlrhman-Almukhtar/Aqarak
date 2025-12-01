from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from app.services.s3 import get_s3_service
router = APIRouter(prefix="/uploads", tags=["uploads"])
@router.post("", summary="Upload a file to S3; returns public URL")
async def upload_file(file: UploadFile = File(...)):
    suffix = Path(file.filename).suffix or ""
    if suffix.lower() not in {".png", ".jpg", ".jpeg", ".webp", ".gif"}:
        raise HTTPException(400, "unsupported file type")
    s3 = get_s3_service()
    content = await file.read()
    try:
        url = s3.upload_file(
            file_content=content,
            filename=file.filename,
            content_type=file.content_type or "image/jpeg",
            folder="property-images"
        )
        return JSONResponse({"url": url})
    except Exception as e:
        raise HTTPException(500, f"Upload failed: {str(e)}")