from aws_cdk import (
    Stack,
    aws_apigateway as apigw,
    aws_lambda as _lambda,
)
from constructs import Construct


class ImageStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, api_gateway: apigw.RestApi, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        api_images = api_gateway.root.add_resource('images')

        process_lambda = _lambda.Function(
            self,
            id=f'{construct_id}-process',
            function_name=f'{construct_id}-process',
            runtime=_lambda.Runtime.PYTHON_3_11,
            code=_lambda.Code.from_asset('src/process'),
            handler='function.lambda_handler',
        )

        api_images.add_method('POST', apigw.LambdaIntegration(process_lambda))
