#!/bin/bash

# 🔄 Update Backend CORS - Run this AFTER deploying to Vercel
# This script will help you update the CORS origins in your backend

echo "======================================"
echo "🔄 DARISTA - Update Backend CORS"
echo "======================================"
echo ""
echo "Run this script AFTER you have deployed:"
echo "1. Consumer Frontend to Vercel"
echo "2. Admin Panel to Vercel"
echo ""
echo "You'll need your actual Vercel deployment URLs."
echo ""

# Get URLs from user
echo "📝 Enter your Vercel URLs:"
echo ""
read -p "Consumer Frontend URL (e.g., https://darista-frontend.vercel.app): " FRONTEND_URL
read -p "Admin Panel URL (e.g., https://darista-admin.vercel.app): " ADMIN_URL

echo ""
echo "You entered:"
echo "Frontend: $FRONTEND_URL"
echo "Admin: $ADMIN_URL"
echo ""
read -p "Is this correct? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Cancelled. Please run the script again."
    exit 1
fi

# Navigate to backend directory
cd "$(dirname "$0")/marque-blanche-ecommerce-backend-main" || exit 1

# Backup original file
cp server.js server.js.backup
echo "✅ Created backup: server.js.backup"

# Update CORS origins in server.js
cat > temp_cors.txt << EOF
app.use(
  cors({
    origin: [
      "http://localhost:3000", 
      "http://localhost:3001", 
      "http://localhost:3002",
      "$FRONTEND_URL",
      "$ADMIN_URL"
    ],
    credentials: true,
  })
);
EOF

# Use sed to replace CORS configuration
# This is a simplified version - you may need to manually edit if this doesn't work
echo ""
echo "⚠️ Important: Please manually update server.js"
echo ""
echo "Open: marque-blanche-ecommerce-backend-main/server.js"
echo ""
echo "Find the cors() configuration (around line 45) and replace with:"
echo ""
cat temp_cors.txt
echo ""
rm temp_cors.txt
echo ""

read -p "Have you updated server.js manually? (yes/no): " UPDATED

if [ "$UPDATED" != "yes" ]; then
    echo "Please update server.js and then run the deployment commands."
    exit 1
fi

# Now redeploy to Azure
echo ""
echo "======================================"
echo "🚀 Redeploying Backend to Azure..."
echo "======================================"
echo ""

# Build Docker image
echo "🔨 Building Docker image..."
docker build -t artboisacrv2.azurecr.io/darista-api:latest .

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed. Please check for errors."
    exit 1
fi

# Push to registry
echo ""
echo "⬆️ Pushing to Azure Container Registry..."
docker push artboisacrv2.azurecr.io/darista-api:latest

if [ $? -ne 0 ]; then
    echo "❌ Docker push failed. Please check for errors."
    exit 1
fi

# Update container app
echo ""
echo "🔄 Updating Azure Container App..."
az containerapp update \
  --name artbois-api-v2 \
  --resource-group artbois-v2-rg \
  --image artboisacrv2.azurecr.io/darista-api:latest

if [ $? -ne 0 ]; then
    echo "❌ Container app update failed. Please check for errors."
    exit 1
fi

echo ""
echo "======================================"
echo "✅ BACKEND CORS UPDATE COMPLETE!"
echo "======================================"
echo ""
echo "Your backend now accepts requests from:"
echo "  - $FRONTEND_URL"
echo "  - $ADMIN_URL"
echo ""
echo "🧪 Test your frontends now - there should be no CORS errors!"
echo ""
