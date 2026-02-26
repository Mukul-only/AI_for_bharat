---
description: How to deploy NexusFlow to AWS using SAM CLI
---

# Deploy NexusFlow to AWS

## Prerequisites

1. AWS CLI installed and configured with your credentials
2. AWS SAM CLI installed (`pip install aws-sam-cli`)
3. Node.js 20.x installed
4. $100 AWS credits activated on your account

## Step 1: Enable Bedrock Model Access

Before deploying, you must enable access to the AI models in the AWS Console:

1. Go to https://console.aws.amazon.com/bedrock
2. Navigate to **Model access** in the left sidebar
3. Click **Manage model access**
4. Enable these models:
   - **Anthropic Claude 3.5 Sonnet v2** (`anthropic.claude-3-5-sonnet-20241022-v2:0`)
   - **Anthropic Claude 3 Haiku** (`anthropic.claude-3-haiku-20240307-v1:0`)
   - **Amazon Titan Image Generator v2** (`amazon.titan-image-generator-v2:0`)
5. Click **Save changes** and wait for access to be granted (usually instant)

## Step 2: Deploy the Backend

// turbo

```bash
sam build --template-file aws/template.yaml
```

```bash
sam deploy --guided
```

When prompted:

- Stack Name: `nexusflow-stack`
- AWS Region: `us-east-1` (recommended for best Bedrock model availability)
- Confirm changes before deploy: `N`
- Allow SAM CLI IAM role creation: `Y`
- Accept all other defaults

## Step 3: Get your API endpoint

After deployment, SAM will output the API Gateway URL. Copy it.

```bash
sam list stack-outputs --stack-name nexusflow-stack --output table
```

## Step 4: Connect Frontend to Backend

Create a `.env` file in the project root:

```
VITE_API_URL=https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/Prod
```

## Step 5: Build and Deploy Frontend to S3

// turbo

```bash
npm run build
```

```bash
aws s3 sync dist/ s3://nexusflow-assets-YOUR_ACCOUNT_ID/frontend/ --delete
```

## Step 6: Verify

1. Open the S3-hosted URL or run `npm run dev` locally with the `.env` file
2. Test content generation with a seed text
3. Test image generation
4. Test viral scoring
5. Check AWS Cost Explorer to monitor spend

## Cleanup

To avoid ongoing charges after the hackathon:

```bash
sam delete --stack-name nexusflow-stack
```
