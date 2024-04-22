/* tslint:disable:no-unused-expression */
import { App } from 'aws-cdk-lib';

import { ApplicationStack } from '../lib/application-stack';

const { AWS_REGION, APP_STAGE } = process.env;

if (!AWS_REGION || !APP_STAGE) {
  throw new Error('Missing environment variables!');
}

const app = new App();
const stackName = `ai-image-labeling-${APP_STAGE}-ui`;

new ApplicationStack(app, stackName, { env: { region: AWS_REGION } });
