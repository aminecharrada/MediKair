#!/bin/bash
# Quick setup helper for Vercel projects

echo "🚀 Art & Bois - Vercel Project Setup Helper"
echo "==========================================="
echo ""
echo "Follow these steps:"
echo ""
echo "1️⃣  Go to https://vercel.com and sign in with GitHub"
echo ""
echo "2️⃣  Create FRONTEND project:"
echo "   - Click 'Add New → Project'"
echo "   - Import: aminecharrada/artbois-ecommerce"
echo "   - Project Name: artbois-frontend"
echo "   - Root Directory: marque-blanche-ecommerce-main"
echo "   - Framework: Create React App"
echo "   - Click Deploy (it will fail - that's OK)"
echo ""
echo "3️⃣  Add Frontend Environment Variables in Vercel:"
echo "   Go to Settings → Environment Variables → Add:"
echo ""
read -p "   REACT_APP_BACKEND_HOST (Azure Container App URL): " BACKEND_HOST
read -p "   REACT_APP_FORMSPREE (Formspree ID): " FORMSPREE
read -p "   REACT_APP_API_KEY (Firebase API Key): " API_KEY
read -p "   REACT_APP_AUTH_DOMAIN (Firebase Auth Domain): " AUTH_DOMAIN
read -p "   REACT_APP_PROJECT_ID (Firebase Project ID): " PROJECT_ID
read -p "   REACT_APP_STORAGE_BUCKET (Firebase Storage): " STORAGE
read -p "   REACT_APP_MESSAGING_SENDER_ID (Firebase Sender): " SENDER
read -p "   REACT_APP_APP_ID (Firebase App ID): " APP_ID
echo ""
echo "4️⃣  Create ADMIN project:"
echo "   - Click 'Add New → Project' again"
echo "   - Import same repo: aminecharrada/artbois-ecommerce"
echo "   - Project Name: artbois-admin"
echo "   - Root Directory: marque-blanche-ecommerce-admin-main"
echo "   - Add Environment Variables:"
echo "     • NODE_OPTIONS = --openssl-legacy-provider"
echo "     • REACT_APP_BACKEND_HOST = $BACKEND_HOST"
echo ""
echo "5️⃣  Get Vercel Credentials:"
echo "   - Token: https://vercel.com/account/tokens (Create new)"
read -p "   Paste VERCEL_TOKEN: " VERCEL_TOKEN
echo ""
echo "   - Org ID: Account Settings → General"
read -p "   Paste VERCEL_ORG_ID: " VERCEL_ORG_ID
echo ""
echo "   - Frontend Project ID: artbois-frontend → Settings → General"
read -p "   Paste VERCEL_PROJECT_ID_FRONTEND: " PROJECT_ID_FRONTEND
echo ""
echo "   - Admin Project ID: artbois-admin → Settings → General"
read -p "   Paste VERCEL_PROJECT_ID_ADMIN: " PROJECT_ID_ADMIN
echo ""
echo "==========================================="
echo "✅ Setup Complete! Now add these to GitHub:"
echo "==========================================="
echo ""
echo "Go to: https://github.com/aminecharrada/artbois-ecommerce/settings/secrets/actions"
echo ""
echo "Add the following secrets:"
echo ""
echo "VERCEL_TOKEN = $VERCEL_TOKEN"
echo "VERCEL_ORG_ID = $VERCEL_ORG_ID"
echo "VERCEL_PROJECT_ID_FRONTEND = $PROJECT_ID_FRONTEND"
echo "VERCEL_PROJECT_ID_ADMIN = $PROJECT_ID_ADMIN"
echo ""
echo "REACT_APP_BACKEND_HOST = $BACKEND_HOST"
echo "REACT_APP_FORMSPREE = $FORMSPREE"
echo "REACT_APP_API_KEY = $API_KEY"
echo "REACT_APP_AUTH_DOMAIN = $AUTH_DOMAIN"
echo "REACT_APP_PROJECT_ID = $PROJECT_ID"
echo "REACT_APP_STORAGE_BUCKET = $STORAGE"
echo "REACT_APP_MESSAGING_SENDER_ID = $SENDER"
echo "REACT_APP_APP_ID = $APP_ID"
echo ""
echo "🎉 Once added, push any change to trigger deployment!"
