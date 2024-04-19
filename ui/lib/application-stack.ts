import { Construct } from 'constructs';
import {
  Stack,
  StageProps,
  aws_cloudfront as cloudfront,
  aws_cloudfront_origins as origins,
  aws_s3 as s3,
  aws_s3_deployment as s3_deployment,
} from 'aws-cdk-lib';

export class ApplicationStack extends Stack {
  constructor(scope: Construct, id: string, props: StageProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, id, {
      bucketName: id,
      accessControl: s3.BucketAccessControl.PRIVATE,
    });

    new s3_deployment.BucketDeployment(this, `${id}-bucket-deployment`, {
      sources: [s3_deployment.Source.asset('./build')],
      destinationBucket: bucket,
    });

    const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, `${id}-origin-access-identity`);
    bucket.grantRead(originAccessIdentity);

    new cloudfront.Distribution(this, `${id}-distribution`, {
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: new origins.S3Origin(bucket, { originAccessIdentity }),
      },
    });
  }
}