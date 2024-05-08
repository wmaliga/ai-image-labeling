import base64
import json
import os
from datetime import date, datetime

from pydantic import BaseModel, field_validator

import boto3
from aws_lambda_powertools.utilities.typing import LambdaContext

s3 = boto3.client("s3")
rekognition = boto3.client("rekognition")


class File(BaseModel):
    name: str
    data: str

    @field_validator("data")
    def data_to_base64(cls, value):
        if not value:
            raise ValueError("data is required")
        try:
            return base64.b64decode(value.encode())
        except Exception:
            raise ValueError("invalid base64 data")


class Body(BaseModel):
    file: File


def lambda_handler(event, context: LambdaContext) -> dict:
    images_bucket = os.environ["IMAGES_BUCKET_NAME"]

    prefix = date.today()
    timestamp = datetime.now().isoformat()

    body = Body.model_validate_json(event["body"])

    file_name = body.file.name
    file_data = body.file.data

    file_key = f"{prefix}/{timestamp}_{file_name}"

    s3.put_object(
        Bucket=images_bucket,
        Key=file_key,
        Body=file_data,
    )

    response = rekognition.detect_labels(
        Image={
            "S3Object": {
                "Bucket": images_bucket,
                "Name": file_key,
            },
        }
    )

    return {
        "statusCode": 200,
        "headers": {"Access-Control-Allow-Origin": "*"},
        "body": json.dumps(response),
    }
