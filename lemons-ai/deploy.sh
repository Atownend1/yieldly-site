#!/bin/bash

# Lemons AI Deployment Script for Netlify
echo "🍋 Deploying Lemons AI to Netlify..."

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo "❌ Error: index.html not found. Make sure you're in the project directory."
    exit 1
fi

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "📦 Installing Netlify CLI..."
    npm install -g netlify-cli
fi

# Login to Netlify (if not already logged in)
echo "🔐 Checking Netlify authentication..."
if ! netlify status &> /dev/null; then
    echo "Please login to Netlify:"
    netlify login
fi

# Deploy to production
echo "🚀 Deploying to production..."
netlify deploy --prod --dir=.

# Get the site URL
echo "✅ Deployment complete!"
echo "🌐 Your site is now live!"
netlify open

echo "📊 Site status:"
netlify status