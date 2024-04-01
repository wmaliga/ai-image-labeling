from aws_cdk import (
    Stack,
    aws_apigateway as apigw,
)
from constructs import Construct


class ApiStack(Stack):
    api_gateway: apigw.RestApi

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        self.api_gateway = apigw.RestApi(
            self,
            id=construct_id,
            rest_api_name=construct_id,
        )
