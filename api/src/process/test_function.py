import json
import os

from botocore.stub import Stubber
from freezegun import freeze_time

from function import lambda_handler, s3

stubber = Stubber(s3)

event = {
    'body': json.dumps({
        'file': {
            'name': 'file.jpeg',
            'data': '==data=='
        }
    })
}


@freeze_time('2024-06-08')
def test_function():
    os.environ['IMAGES_BUCKET_NAME'] = 'images-bucket'

    stubber.add_response(
        'put_object',
        {},
        {
            'Bucket': 'images-bucket',
            'Key': '2024-06-08/2024-06-08T00:00:00_file.jpeg',
            'Body': b'u\xabZ',
        })
    stubber.activate()

    expected_response = {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps('ok'),
    }

    assert lambda_handler(event, {}) == expected_response
