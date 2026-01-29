#!/bin/bash

# Configuration
PROJECT_ID=$(gcloud config get-value project)
SERVICE_NAME="preptime-ml-service"
REGION="us-central1"

if [ -z "$PROJECT_ID" ]; then
    echo "Error: No Google Cloud project selected."
    echo "Please run 'gcloud auth login' and 'gcloud config set project <YOUR_PROJECT_ID>' first."
    exit 1
fi

echo "Deploying to Project: $PROJECT_ID"
echo "Service Name: $SERVICE_NAME"
echo "Region: $REGION"
echo ""

# Enable required services (only needs to be done once, but safe to repeat)
echo "Enabling required APIs..."
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable artifactregistry.googleapis.com

# Submit build and deploy
echo "Building and deploying to Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
    --source . \
    --region "$REGION" \
    --allow-unauthenticated \
    --project "$PROJECT_ID"

echo ""
echo "Deployment complete!"
echo "If successful, copy the Service URL above and update your web/.env.local file with:"
echo "ML_SERVICE_URL=<YOUR_SERVICE_URL>"
