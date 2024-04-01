#!/usr/bin/env python3
import os

import aws_cdk as cdk

from lib.api_stack import ApiStack
from lib.image_stack import ImageStack

region = os.environ['AWS_REGION']
stage = os.environ['APP_STAGE']

if not region or not stage:
    raise Exception('Missing environment variables!')

stack_name = f'ai-image-labeling-{stage}'

app = cdk.App()

api_stack = ApiStack(
    app,
    f'{stack_name}-api'
)

ImageStack(
    app,
    f'{stack_name}-image',
    api_gateway=api_stack.api_gateway,
)

app.synth()
