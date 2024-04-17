import aws_cdk as core
import aws_cdk.assertions as assertions

from .api_stack import ApiStack
from .image_stack import ImageStack


def test_rest_api_created():
    app = core.App()
    api_stack = ApiStack(app, "test-api")
    ImageStack(app, "image-stack", api_stack.api_gateway)
    template = assertions.Template.from_stack(api_stack)

    template.has_resource_properties("AWS::ApiGateway::RestApi", {"Name": "test-api"})
