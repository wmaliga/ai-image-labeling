from aws_cdk import (
    Stack,
    aws_apigateway as apigw,
    aws_iam as iam,
    aws_lambda as _lambda,
    aws_lambda_python_alpha as lambda_python,
    aws_s3 as s3,
)
from constructs import Construct


class ImageStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, api_gateway: apigw.RestApi, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        api_images = api_gateway.root.add_resource('images')

        images_bucket = s3.Bucket(
            self,
            construct_id,
            bucket_name=construct_id
        )

        process_lambda = lambda_python.PythonFunction(
            self,
            id=f'{construct_id}-process',
            function_name=f'{construct_id}-process',
            runtime=_lambda.Runtime.PYTHON_3_11,
            entry='src/process',
            index='function.py',
            handler='lambda_handler',
            environment={
                'IMAGES_BUCKET_NAME': images_bucket.bucket_name,
            }
        )

        api_images.add_method('POST', apigw.LambdaIntegration(process_lambda))
        images_bucket.grant_read_write(process_lambda)
        process_lambda.add_to_role_policy(iam.PolicyStatement(
            effect=iam.Effect.ALLOW,
            actions=['rekognition:DetectLabels'],
            resources=['*'],
        ))
