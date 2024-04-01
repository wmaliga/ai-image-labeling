from function import lambda_handler


def test_function():
    expected_response = {
        'statusCode': 200,
        'body': 'test'
    }

    assert lambda_handler({}, {}) == expected_response
