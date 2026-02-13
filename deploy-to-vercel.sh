#!/bin/bash

# Koppling - Vercel Deployment Script
# Run this script in your terminal to deploy to Vercel

set -e  # Exit on error

echo "🚀 Koppling Vercel Deployment Script"
echo "======================================"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm i -g vercel
fi

echo "✅ Vercel CLI found"
echo ""

# Step 1: Link project to Vercel
echo "📎 Step 1: Linking project to Vercel..."
echo "When prompted:"
echo "  - Set up and deploy? → Yes"
echo "  - Which scope? → gregs-projects-26345a6c"
echo "  - Link to existing project? → No"
echo "  - Project name? → koppling"
echo "  - Code directory? → ./ (press Enter)"
echo ""
vercel link

echo ""
echo "✅ Project linked!"
echo ""

# Step 2: Create Postgres Database
echo "💾 Step 2: Creating Vercel Postgres database..."
echo "When prompted:"
echo "  - Database name? → koppling-db (or your preference)"
echo "  - Region? → Choose closest to you"
echo ""
read -p "Press Enter to create database..."
vercel storage create postgres

echo ""
echo "✅ Database created! DATABASE_URL has been automatically set."
echo ""

# Step 3: Generate and add environment variables
echo "🔐 Step 3: Setting up environment variables..."
echo ""

# Generate secrets
echo "Generating NEXTAUTH_SECRET..."
NEXTAUTH_SECRET=$(openssl rand -base64 32)

echo "Generating ENCRYPTION_KEY..."
ENCRYPTION_KEY=$(openssl rand -base64 32)

echo ""
echo "Adding environment variables to Vercel..."
echo ""

# Add NEXTAUTH_SECRET
echo "Adding NEXTAUTH_SECRET..."
echo "$NEXTAUTH_SECRET" | vercel env add NEXTAUTH_SECRET production
echo "$NEXTAUTH_SECRET" | vercel env add NEXTAUTH_SECRET preview
echo "$NEXTAUTH_SECRET" | vercel env add NEXTAUTH_SECRET development

# Add ENCRYPTION_KEY
echo "Adding ENCRYPTION_KEY..."
echo "$ENCRYPTION_KEY" | vercel env add ENCRYPTION_KEY production
echo "$ENCRYPTION_KEY" | vercel env add ENCRYPTION_KEY preview
echo "$ENCRYPTION_KEY" | vercel env add ENCRYPTION_KEY development

# Add NEXTAUTH_URL (will be set after first deployment)
echo ""
echo "Note: NEXTAUTH_URL will be set after first deployment"
echo ""

echo "✅ Environment variables added!"
echo ""

# Step 4: Deploy to production
echo "🚢 Step 4: Deploying to production..."
echo ""
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""

# Step 5: Run database migrations
echo "📊 Step 5: Running database migrations..."
echo ""
echo "This will set up all 14 tables in your production database."
read -p "Press Enter to run migrations..."
npx prisma migrate deploy

echo ""
echo "✅ Migrations complete!"
echo ""

# Get deployment URL
DEPLOY_URL=$(vercel ls --scope gregs-projects-26345a6c | grep koppling | head -1 | awk '{print $2}')

echo "======================================"
echo "🎉 Deployment Complete!"
echo "======================================"
echo ""
echo "Your app is live at: https://$DEPLOY_URL"
echo ""
echo "Next steps:"
echo "1. Add NEXTAUTH_URL to environment variables:"
echo "   vercel env add NEXTAUTH_URL production"
echo "   Value: https://$DEPLOY_URL"
echo ""
echo "2. Add optional environment variables as needed:"
echo "   - STRIPE_SECRET_KEY"
echo "   - STRIPE_WEBHOOK_SECRET"
echo "   - FORTNOX_CLIENT_ID"
echo "   - FORTNOX_CLIENT_SECRET"
echo "   - SHOPIFY_API_KEY"
echo "   - SHOPIFY_API_SECRET"
echo ""
echo "3. Visit your app at https://$DEPLOY_URL"
echo ""
echo "📝 Save these generated secrets:"
echo "NEXTAUTH_SECRET=$NEXTAUTH_SECRET"
echo "ENCRYPTION_KEY=$ENCRYPTION_KEY"
echo ""
