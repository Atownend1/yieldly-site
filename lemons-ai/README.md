# Lemons AI - Yieldly Website

A modern, responsive website for Yieldly - transforming complexity into clarity through design, data, and engineering.

## Features

- 🎨 Modern, responsive design with glassmorphism effects
- ⚡ Optimized performance with lazy loading
- 📱 Mobile-first responsive layout
- 🎯 Interactive animations and effects
- 🔒 Security headers and best practices
- 📊 Contact form with Netlify Forms integration

## Tech Stack

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS custom properties
- **JavaScript** - Interactive features and animations
- **Canvas API** - Animated light ray effects

## Deployment to Netlify

### Method 1: Git Integration (Recommended)

1. **Push to Git Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Connect to Netlify**
   - Go to [Netlify](https://app.netlify.com/)
   - Click "New site from Git"
   - Choose your Git provider (GitHub, GitLab, Bitbucket)
   - Select your repository
   - Configure build settings:
     - Build command: (leave empty)
     - Publish directory: `.`
   - Click "Deploy site"

### Method 2: Drag & Drop Deployment

1. **Prepare Files**
   - Ensure all files are in the `lemons-ai` directory
   - Required files: `index.html`, `style.css`, `script.js`, `netlify.toml`

2. **Deploy to Netlify**
   - Go to [Netlify](https://app.netlify.com/)
   - Drag and drop the `lemons-ai` folder onto the deployment area
   - Your site will be deployed instantly!

### Method 3: Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login and Deploy**
   ```bash
   netlify login
   netlify deploy --prod --dir=.
   ```

## Configuration

The `netlify.toml` file includes:

- **Security Headers** - XSS protection, frame options, content type sniffing prevention
- **Cache Control** - Optimized caching for static assets
- **Form Handling** - Netlify Forms integration for the contact form
- **Performance** - CSS/JS minification and image compression
- **Redirects** - SPA-style routing support

## Customization

### Update Content

- Edit `index.html` to modify text content, sections, and structure
- Update contact information in the footer and contact section
- Replace placeholder images in the `assets/` directory

### Styling

- Modify CSS custom properties in `:root` for color scheme changes
- Update responsive breakpoints in `style.css`
- Customize animations and transitions

### Features

- Add new sections by following the existing HTML structure
- Extend JavaScript functionality in `script.js`
- Add more interactive elements or animations

## Assets

Create an `assets/` directory and add:

- `hero-video.mp4` - Hero section background video
- `work-1.jpg`, `work-2.jpg`, `work-3.jpg` - Work showcase images
- `about-visual.jpg` - About section image
- Any additional images or media files

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

The site is optimized for:

- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Core Web Vitals compliance
- Mobile performance

## License

This project is proprietary. All rights reserved.

---

**Live Site**: Your Netlify URL will be provided after deployment
**Status**: [![Netlify Status](https://api.netlify.com/api/v1/badges/your-site-id/deploy-status.svg)](https://app.netlify.com/sites/your-site-name/deploys)