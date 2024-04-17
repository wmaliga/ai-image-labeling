import base64
import json
import os
from datetime import date, datetime

import boto3
from aws_lambda_powertools.utilities.typing import LambdaContext

s3 = boto3.client('s3')
rekognition = boto3.client('rekognition')


def lambda_handler(event: dict, context: LambdaContext) -> dict:
    images_bucket = os.environ['IMAGES_BUCKET_NAME']

    prefix = date.today()
    timestamp = datetime.now().isoformat()

    body = json.loads(event['body'])
    file_name = body['file']['name']
    file_data = base64.b64decode(body['file']['data'].encode())

    file_key = f'{prefix}/{timestamp}_{file_name}'

    s3.put_object(
        Bucket=images_bucket,
        Key=file_key,
        Body=file_data,
    )

    response = rekognition.detect_labels(
        Image={
            'S3Object': {
                'Bucket': images_bucket,
                'Name': file_key,
            },
        }
    )

    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(response)
    }
