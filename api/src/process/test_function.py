import json
import os

from botocore.stub import Stubber
from freezegun import freeze_time

event = {
    'body': json.dumps({
        'file': {
            'name': 'file.jpeg',
            'data': '==data==',
        },
    })
}

rekognition_response = {
    'Labels': [
        {'Name': 'test', 'Confidence': 99},
    ],
}


@freeze_time('2024-06-08')
def test_function():
    os.environ['AWS_DEFAULT_REGION'] = 'eu-central-1'
    os.environ['IMAGES_BUCKET_NAME'] = 'images-bucket'

    from function import lambda_handler, s3, rekognition

    stubber_s3 = Stubber(s3)
    stubber_rekognition = Stubber(rekognition)

    stubber_s3.add_response(
        'put_object',
        {},
        {
            'Bucket': 'images-bucket',
            'Key': '2024-06-08/2024-06-08T00:00:00_file.jpeg',
            'Body': b'u\xabZ',
        })
    stubber_s3.activate()

    stubber_rekognition.add_response(
        'detect_labels',
        rekognition_response,
        {
            'Image': {
                'S3Object': {
                    'Bucket': 'images-bucket',
                    'Name': '2024-06-08/2024-06-08T00:00:00_file.jpeg',
                },
            }
        }
    )
    stubber_rekognition.activate()

    expected_response = {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(rekognition_response),
    }

    assert lambda_handler(event, {}) == expected_response
