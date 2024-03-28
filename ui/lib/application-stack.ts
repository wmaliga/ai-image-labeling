import { Construct } from 'constructs';
import {
  Stack,
  StageProps,
  aws_s3 as s3,
  aws_s3_deployment as s3_deployment,
} from 'aws-cdk-lib';

export class ApplicationStack extends Stack {
  constructor(scope: Construct, id: string, props: StageProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, id, {
      bucketName: id,
      accessControl: s3.BucketAccessControl.PUBLIC_READ,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
      publicReadAccess: true,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
    });

    new s3_deployment.BucketDeployment(this, `${id}-bucket-deployment`, {
      sources: [s3_deployment.Source.asset('./build')],
      destinationBucket: bucket,
    });
  }
}