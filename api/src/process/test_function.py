from function import lambda_handler


def test_function():
    assert lambda_handler({}, {}) == {'test': 'data'}
