import aws_cdk as core
import aws_cdk.assertions as assertions

from .api_stack import ApiStack
from .image_stack import ImageStack


def test_lambda_created():
    app = core.App()
    api_stack = ApiStack(app, 'test-api')
    stack = ImageStack(app, 'image-stack', api_stack.api_gateway)
    template = assertions.Template.from_stack(stack)

    template.has_resource_properties('AWS::Lambda::Function', {
        'FunctionName': 'image-stack-process'
    })
