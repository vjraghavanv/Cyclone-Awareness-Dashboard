# Deployment Guide

This guide covers deploying the Cyclone Awareness Dashboard to various platforms.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Build Configuration](#build-configuration)
- [Deployment Options](#deployment-options)
  - [Vercel](#vercel)
  - [GitHub Pages](#github-pages)
  - [Netlify](#netlify)
  - [Custom Server](#custom-server)
- [Post-Deployment](#post-deployment)

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git repository
- Account on deployment platform (Vercel, GitHub, etc.)

## Environment Variables

The application uses environment variables for configuration. Copy `.env.example` to create your environment files:

```bash
# Development
cp .env.example .env.development

# Production
cp .env.example .env.production
```

### Required Variables

- `VITE_API_BASE_URL`: Base URL for the API endpoints
- `VITE_ENABLE_MOCK_DATA`: Enable/disable mock data (true for dev, false for prod)

### Optional Variables

- `VITE_ZOOM_EARTH_EMBED_URL`: Zoom Earth embed URL
- `VITE_WINDY_EMBED_URL`: Windy embed URL
- `VITE_CACHE_ENABLED`: Enable/disable caching
- `VITE_CACHE_TTL_MINUTES`: Cache TTL in minutes
- `VITE_LOG_LEVEL`: Logging level (debug, info, warn, error)
- `VITE_ENABLE_LIVE_EMBEDS`: Enable/disable live map embeds

## Build Configuration

### Production Build

```bash
npm run build:prod
```

This will:
- Type-check the code
- Build optimized production bundle
- Minify JavaScript and CSS
- Generate source maps (if enabled)
- Output to `dist/` directory

### Build Analysis

To analyze bundle size:

```bash
npm run analyze
```

### Preview Production Build

```bash
npm run preview
```

## Deployment Options

### Vercel

#### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/cyclone-awareness-dashboard)

#### Manual Deployment

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel --prod
   ```

4. Configure environment variables in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add all required variables from `.env.production`

#### Configuration

The `vercel.json` file is already configured with:
- Static build configuration
- Asset caching headers
- Security headers
- SPA routing

### GitHub Pages

#### Automatic Deployment

The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically deploys to GitHub Pages on push to `main` branch.

#### Setup

1. Enable GitHub Pages in repository settings:
   - Go to Settings → Pages
   - Source: GitHub Actions

2. Add secrets to repository:
   - Go to Settings → Secrets and variables → Actions
   - Add `VITE_API_BASE_URL` and other required variables

3. Push to main branch:
   ```bash
   git push origin main
   ```

4. The workflow will automatically build and deploy

#### Manual Deployment

```bash
# Build for GitHub Pages
npm run build:prod

# Deploy using gh-pages (install first: npm install -g gh-pages)
gh-pages -d dist
```

### Netlify

#### Quick Deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/cyclone-awareness-dashboard)

#### Manual Deployment

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Login to Netlify:
   ```bash
   netlify login
   ```

3. Initialize site:
   ```bash
   netlify init
   ```

4. Deploy:
   ```bash
   netlify deploy --prod
   ```

#### Configuration

Create `netlify.toml`:

```toml
[build]
  command = "npm run build:prod"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Custom Server

#### Using Node.js

1. Build the application:
   ```bash
   npm run build:prod
   ```

2. Serve using a static file server:
   ```bash
   npm install -g serve
   serve -s dist -p 3000
   ```

#### Using Nginx

1. Build the application:
   ```bash
   npm run build:prod
   ```

2. Copy `dist/` contents to Nginx web root:
   ```bash
   cp -r dist/* /var/www/html/
   ```

3. Configure Nginx (`/etc/nginx/sites-available/cyclone-dashboard`):

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Cache static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

4. Enable site and reload Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/cyclone-dashboard /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

## Post-Deployment

### Verification Checklist

- [ ] Application loads without errors
- [ ] All components render correctly
- [ ] API endpoints are accessible
- [ ] Mock data is disabled in production
- [ ] Maps display correctly
- [ ] Language switching works
- [ ] Local Storage persists data
- [ ] Responsive design works on mobile
- [ ] Accessibility features work
- [ ] Error boundaries catch errors
- [ ] Data freshness indicators update

### Performance Optimization

1. **Enable CDN**: Use a CDN for static assets
2. **Enable Compression**: Ensure gzip/brotli compression is enabled
3. **Monitor Performance**: Use Lighthouse or WebPageTest
4. **Set up Monitoring**: Configure error tracking (Sentry, etc.)

### Security

1. **HTTPS**: Always use HTTPS in production
2. **Security Headers**: Verify security headers are set
3. **API Keys**: Never commit API keys to repository
4. **CORS**: Configure CORS properly on API server

### Monitoring

Consider setting up:
- Error tracking (Sentry, Rollbar)
- Analytics (Google Analytics, Plausible)
- Uptime monitoring (UptimeRobot, Pingdom)
- Performance monitoring (Lighthouse CI)

## Troubleshooting

### Build Fails

- Check Node.js version (18+ required)
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run type-check`

### Environment Variables Not Working

- Ensure variables start with `VITE_`
- Restart dev server after changing .env files
- Check that .env file is in project root

### Assets Not Loading

- Check base URL in vite.config.ts
- Verify asset paths are relative
- Check browser console for 404 errors

### SPA Routing Issues

- Ensure server is configured for SPA routing
- Check that all routes redirect to index.html
- Verify base URL configuration

## Support

For issues or questions:
- Check the [README.md](./README.md)
- Review [ACCESSIBILITY.md](./ACCESSIBILITY.md)
- Open an issue on GitHub
