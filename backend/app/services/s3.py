import os
import logging
from typing import Optional
from pathlib import Path
import boto3
from botocore.exceptions import ClientError
from uuid import uuid4

logger = logging.getLogger(__name__)


class S3Service:
    
    def __init__(self):
        self.aws_access_key = os.getenv('AWS_ACCESS_KEY_ID')
        self.aws_secret_key = os.getenv('AWS_SECRET_ACCESS_KEY')
        self.aws_region = os.getenv('AWS_REGION', 'us-east-1')
        self.bucket_name = os.getenv('AWS_S3_BUCKET')
        
        if not all([self.aws_access_key, self.aws_secret_key, self.bucket_name]):
            logger.warning("S3 credentials not configured. File uploads will fail.")
            self.enabled = False
            self.s3_client = None
        else:
            self.enabled = True
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=self.aws_access_key,
                aws_secret_access_key=self.aws_secret_key,
                region_name=self.aws_region
            )
    
    def upload_file(
        self, 
        file_content: bytes, 
        filename: str, 
        content_type: str = "image/jpeg",
        folder: str = "uploads"
    ) -> str:
        if not self.enabled:
            raise RuntimeError("S3 service is not configured. Set AWS credentials in environment.")
        suffix = Path(filename).suffix.lower() or ".jpg"
        key = f"{folder}/{uuid4().hex}{suffix}"
        try:
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=key,
                Body=file_content,
                ContentType=content_type
            )
            url = f"https://{self.bucket_name}.s3.{self.aws_region}.amazonaws.com/{key}"
            logger.info(f"Successfully uploaded file to S3: {url}")
            return url
            
        except ClientError as e:
            logger.error(f"Failed to upload file to S3: {e}")
            raise
    
    def delete_file(self, url: str) -> bool:

        if not self.enabled:
            logger.warning("S3 service is not configured. Cannot delete file.")
            return False
        
        try:

            key = url.split(f"{self.bucket_name}.s3")[1].split("/", 2)[2]
            
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=key
            )
            logger.info(f"Successfully deleted file from S3: {key}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to delete file from S3: {e}")
            return False


_s3_service: Optional[S3Service] = None


def get_s3_service() -> S3Service:
    global _s3_service
    if _s3_service is None:
        _s3_service = S3Service()
    return _s3_service
