#!/bin/bash

# Lemon-AI Website Deployment Script
# This script helps deploy the website to Netlify

echo "🍋 Lemon-AI Website Deployment"
echo "================================"

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI not found. Installing..."
    npm install -g netlify-cli
fi

# Check if user is logged in to Netlify
if ! netlify status &> /dev/null; then
    echo "🔐 Please log in to Netlify..."
    netlify login
fi

# Deploy to Netlify
echo "🚀 Deploying to Netlify..."
netlify deploy --prod --dir=.

echo "✅ Deployment complete!"
echo "🌐 Your site is now live on Netlify!"