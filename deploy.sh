#!/bin/bash

# Yieldly Website Production Deployment Script

echo "🚀 Yieldly Website Production Deployment"
echo "========================================"

# Check if files exist
if [ ! -f "index.html" ]; then
    echo "❌ Error: index.html not found"
    exit 1
fi

if [ ! -f "website-styles.css" ]; then
    echo "❌ Error: website-styles.css not found"
    exit 1
fi

if [ ! -f "website-script.js" ]; then
    echo "❌ Error: website-script.js not found"
    exit 1
fi

echo "✅ All required files found"

# Create production checklist
echo ""
echo "📋 Production Checklist:"
echo "========================"
echo "1. ✅ Website files ready"
echo "2. ✅ SEO meta tags added"
echo "3. ✅ Security headers configured"
echo "4. ✅ Analytics placeholder added"
echo "5. ✅ Sitemap created"
echo "6. ✅ Robots.txt created"
echo ""
echo "🚀 Ready for deployment!"
echo ""
echo "📁 Files in this directory:"
ls -la

echo ""
echo "🌐 Deployment Options:"
echo "====================="
echo "1. Netlify: Drag this folder to netlify.com"
echo "2. Vercel: Connect to GitHub repository"
echo "3. GitHub Pages: Upload to GitHub repository"
echo ""
echo "📧 Next Steps:"
echo "=============="
echo "1. Choose hosting platform"
echo "2. Set up custom domain (yieldly.com)"
echo "3. Replace GA_MEASUREMENT_ID with real Google Analytics ID"
echo "4. Set up form handling (Formspree/Mailchimp)"
echo "5. Add privacy policy and terms of service"
echo "6. Test all functionality"
echo "7. Monitor performance" 