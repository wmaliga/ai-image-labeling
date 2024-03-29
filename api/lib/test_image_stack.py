import aws_cdk as core
import aws_cdk.assertions as assertions

from .image_stack import ImageStack


def test_lambda_created():
    app = core.App()
    stack = ImageStack(app, 'image-stack')
    template = assertions.Template.from_stack(stack)

    template.has_resource_properties('AWS::Lambda::Function', {
        'FunctionName': 'image-stack-process'
    })
