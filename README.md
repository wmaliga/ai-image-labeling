[![Build API](https://github.com/wmaliga/ai-image-labeling/actions/workflows/build-api.yaml/badge.svg?branch=master)](https://github.com/wmaliga/ai-image-labeling/actions/workflows/build-api.yaml) [![Build UI](https://github.com/wmaliga/ai-image-labeling/actions/workflows/build-ui.yaml/badge.svg?branch=master)](https://github.com/wmaliga/ai-image-labeling/actions/workflows/build-ui.yaml)

# ai-image-labeling

## Description
Use AI model to describe image content with labels.

### Frontend
React application hosted with S3 Bucket and CloudFront.

```bash
npm run build      # build application
npm start          # local run
npm test           # run tests
cdk deploy --all   # deploy to AWS
```

> API token should be copied from API Gateway.

### Backend
AWS Lambda function to process image and return labels.

```bash
pytest             # run tests
cdk deploy --all   # deploy to AWS
```

> After deployment create API Gateway access token to secure API.