#!/bin/bash
# Script to configure backend environment variables in Azure Container Apps

echo "🔧 Configure Backend Environment Variables"
echo "==========================================="
echo ""
echo "Enter your credentials (they will be stored as secrets in Azure Container Apps):"
echo ""

read -p "MongoDB Atlas URI: " DB_URI
read -p "JWT Secret (run: openssl rand -hex 32): " JWT_SECRET
read -p "Cloudinary Cloud Name: " CLOUDINARY_NAME
read -p "Cloudinary API Key: " CLOUDINARY_KEY
read -sp "Cloudinary API Secret: " CLOUDINARY_SECRET
echo ""

echo ""
echo "🔄 Updating Azure Container App with secrets..."

az containerapp update \
  --name artbois-api \
  --resource-group artbois-rg \
  --set-env-vars \
    "PORT=8080" \
    "NODE_ENV=production" \
    "JWT_EXPIRE=5d" \
    "COOKIE_EXPIRE=5" \
    "DB_URI=secretref:db-uri" \
    "JWT_SECRET=secretref:jwt-secret" \
    "CLOUDINARY_CLOUD_NAME=secretref:cloudinary-name" \
    "CLOUDINARY_API_KEY=secretref:cloudinary-key" \
    "CLOUDINARY_API_SECRET=secretref:cloudinary-secret" \
  --secrets \
    "db-uri=$DB_URI" \
    "jwt-secret=$JWT_SECRET" \
    "cloudinary-name=$CLOUDINARY_NAME" \
    "cloudinary-key=$CLOUDINARY_KEY" \
    "cloudinary-secret=$CLOUDINARY_SECRET"

echo ""
echo "✅ Backend configured! Testing..."
sleep 10

URL=$(az containerapp show --name artbois-api --resource-group artbois-rg --query "properties.configuration.ingress.fqdn" -o tsv)
echo ""
echo "🌐 Backend URL: https://$URL"
echo "🧪 Testing /api/products endpoint..."
curl -s "https://$URL/api/products" | head -5

echo ""
echo ""
echo "✅ Done! Your backend is now configured."
echo "   Add this URL to GitHub Secrets as REACT_APP_BACKEND_HOST:"
echo "   https://$URL"
