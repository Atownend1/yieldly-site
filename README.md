# Lemon-AI Website

A modern, responsive website for Lemon-AI - the trust layer for legal data. Built with HTML, CSS, and JavaScript, optimized for Netlify deployment.

## 🎨 Brand Identity

### Color Palette
- **Electric Purple**: `#B064F4`
- **Neon Violet**: `#A046F4`
- **Teal Green**: `#37E0D3`
- **Midnight Navy**: `#0E0B24`
- **Soft Indigo Gradient**: `#3B2C72` → `#1D0B45`

### Typography
- **Primary Font**: Poppins (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700, 800

## 🚀 Features

- **Modern Design**: Dark theme with gradient accents
- **Responsive Layout**: Mobile-first approach
- **Interactive Elements**: Smooth animations and hover effects
- **Contact Form**: Functional demo request form
- **Performance Optimized**: Fast loading and smooth scrolling
- **Accessibility**: Keyboard navigation and screen reader support

## 📁 Project Structure

```
lemon-ai-website/
├── index.html          # Main HTML file
├── styles.css          # CSS styles and animations
├── script.js           # JavaScript functionality
└── README.md          # Project documentation
```

## 🛠️ Setup Instructions

### Local Development

1. **Clone or download** the project files
2. **Open** `index.html` in your web browser
3. **Or serve locally** using a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js (if you have http-server installed)
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```

### Netlify Deployment

#### Option 1: Drag & Drop
1. Go to [netlify.com](https://netlify.com)
2. Sign up/login to your account
3. Drag and drop the project folder to the Netlify dashboard
4. Your site will be deployed automatically

#### Option 2: Git Integration
1. Push your code to a Git repository (GitHub, GitLab, etc.)
2. Connect your repository to Netlify
3. Deploy automatically on every push

#### Option 3: Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

## 🎯 Business Overview

Lemon-AI makes legal data instantly reliable so every e-discovery, contract-analysis and GenAI workflow can be trusted and priced with certainty.

### Key Value Propositions
- **37% Error Reduction** in legal data processing
- **6TB Data Processed** in pilot programs
- **£3.4B Annual Savings** potential for the industry
- **90-day deployment** timeline
- **SaaS model** with usage-based pricing

### Target Markets
- **TAM (Global)**: £9.5B
- **SAM (UK + NA)**: £720M
- **SOM (3-yr)**: £78M

## 📱 Responsive Design

The website is fully responsive and optimized for:
- **Desktop**: 1200px+ (full experience)
- **Tablet**: 768px - 1199px (adapted layout)
- **Mobile**: 320px - 767px (mobile-first)

## 🔧 Customization

### Colors
Update the CSS variables in `styles.css`:
```css
:root {
    --electric-purple: #B064F4;
    --neon-violet: #A046F4;
    --teal-green: #37E0D3;
    --midnight-navy: #0E0B24;
    /* ... */
}
```

### Content
- Update business information in `index.html`
- Modify team details, pricing, and contact information
- Replace placeholder content with actual company data

### Features
- Add analytics tracking (Google Analytics, etc.)
- Integrate with CRM systems for lead capture
- Add blog functionality
- Implement multi-language support

## 🚀 Performance Features

- **Optimized Images**: Use WebP format for better compression
- **Minified CSS/JS**: For production deployment
- **Lazy Loading**: For better page load times
- **CDN Integration**: For faster global delivery
- **Caching**: Browser and server-side caching

## 🔒 Security Considerations

- **HTTPS**: Always use HTTPS in production
- **Form Validation**: Client and server-side validation
- **XSS Protection**: Sanitize user inputs
- **CSP Headers**: Content Security Policy implementation

## 📊 Analytics & Tracking

To add analytics, include the following in the `<head>` section:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🐛 Browser Support

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## 📞 Support

For technical support or customization requests:
- **Email**: hello@lemon-ai.com
- **Phone**: +44 (0) 20 1234 5678

## 📄 License

This project is proprietary to Lemon-AI. All rights reserved.

---

**Built with ❤️ for Lemon-AI**