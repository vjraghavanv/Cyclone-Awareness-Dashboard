# Build Configuration Guide

This document explains the build configuration and optimization strategies for the Cyclone Awareness Dashboard.

## Table of Contents

- [Build Process](#build-process)
- [Code Splitting](#code-splitting)
- [Environment Configuration](#environment-configuration)
- [Asset Optimization](#asset-optimization)
- [Build Scripts](#build-scripts)
- [Performance Targets](#performance-targets)
- [Troubleshooting](#troubleshooting)

## Build Process

The application uses Vite as the build tool, which provides:

- Fast Hot Module Replacement (HMR) in development
- Optimized production builds with code splitting
- Automatic CSS minification
- Tree shaking to remove unused code
- Asset optimization and hashing

### Build Command

```bash
# Development build
npm run build

# Production build (recommended)
npm run build:prod
```

### Build Output

The build process creates a `dist/` directory with:

```
dist/
├── index.html              # Entry HTML file
├── assets/
│   ├── index-[hash].js     # Main application bundle
│   ├── react-vendor-[hash].js    # React libraries
│   ├── map-vendor-[hash].js      # Leaflet mapping library
│   ├── aria-vendor-[hash].js     # React ARIA components
│   ├── components-[hash].js      # UI components
│   ├── services-[hash].js        # Service layer
│   ├── vendor-[hash].js          # Other dependencies
│   └── index-[hash].css          # Compiled styles
└── vite.svg                # Static assets
```

## Code Splitting

The application implements strategic code splitting to optimize bundle size and loading performance.

### Vendor Chunks

Large third-party libraries are split into separate chunks:

1. **react-vendor**: React and React-DOM (~130KB)
2. **map-vendor**: Leaflet mapping library (~140KB)
3. **aria-vendor**: React ARIA accessibility components (~80KB)
4. **vendor**: Other third-party dependencies

### Feature Chunks

Application code is split by feature:

1. **components**: All UI components
2. **services**: API client, cache, storage, and other services

### Benefits

- **Better Caching**: Vendor code changes less frequently than application code
- **Parallel Loading**: Browser can download multiple chunks simultaneously
- **Faster Updates**: Users only download changed chunks on updates
- **Reduced Initial Load**: Critical code loads first, non-critical code loads on demand

## Environment Configuration

### Environment Files

The application uses three environment files:

1. **`.env.example`**: Template with all available variables (committed to git)
2. **`.env.development`**: Development configuration (committed to git)
3. **`.env.production`**: Production configuration (committed to git)
4. **`.env.local`**: Local overrides (NOT committed to git)

### Environment Variables

All environment variables must be prefixed with `VITE_` to be exposed to the application.

#### Required Variables

```bash
# API Configuration
VITE_API_BASE_URL=https://api.example.com
VITE_ENABLE_MOCK_DATA=false

# Logging
VITE_LOG_LEVEL=error
```

#### Optional Variables

```bash
# Map Embeds
VITE_ZOOM_EARTH_EMBED_URL=https://zoom.earth/#view=13.0827,80.2707,8z
VITE_WINDY_EMBED_URL=https://embed.windy.com/embed2.html?lat=13.0827&lon=80.2707&zoom=8

# Cache Configuration
VITE_CACHE_ENABLED=true
VITE_CACHE_TTL_MINUTES=5

# Feature Flags
VITE_ENABLE_LIVE_EMBEDS=true
```

### Accessing Environment Variables

```typescript
// In TypeScript code
import { environment } from './config/environment';

console.log(environment.apiBaseUrl);
console.log(environment.enableMockData);
```

### Environment-Specific Builds

```bash
# Development build (uses .env.development)
npm run dev

# Production build (uses .env.production)
npm run build:prod
```

## Asset Optimization

### Images

The application uses minimal images to keep bundle size small. For any images you add:

1. **Use WebP format** for better compression:
   ```bash
   # Convert PNG to WebP
   cwebp input.png -o output.webp -q 80
   ```

2. **Optimize existing images**:
   ```bash
   # Using imagemin
   npm install -g imagemin-cli imagemin-webp
   imagemin src/assets/*.{jpg,png} --out-dir=src/assets/optimized --plugin=webp
   ```

3. **Recommended sizes**:
   - Icons: 24x24, 32x32, 48x48 pixels
   - Thumbnails: 150x150 pixels
   - Hero images: Max 1920x1080 pixels

### Fonts

The application uses system fonts for optimal performance:

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
  'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
```

If you need custom fonts:

1. Use WOFF2 format (best compression)
2. Subset fonts to include only needed characters
3. Use `font-display: swap` for better perceived performance

### CSS

- TailwindCSS automatically purges unused styles in production
- CSS is minified and extracted to a separate file
- Critical CSS is inlined in the HTML

### JavaScript

Production builds include:

- **Minification**: Using Terser with aggressive settings
- **Tree Shaking**: Removes unused code
- **Dead Code Elimination**: Removes unreachable code
- **Console Removal**: Removes console.log statements

## Build Scripts

### Core Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build:prod

# Preview production build locally
npm run preview

# Run tests
npm run test

# Type check
npm run type-check

# Lint code
npm run lint
```

### Optimization Scripts

```bash
# Analyze asset sizes
npm run optimize-assets

# Run pre-deployment checks
npm run pre-deploy

# Analyze bundle size
npm run analyze
```

### Deployment Scripts

```bash
# Deploy to Vercel
npm run deploy:vercel

# Deploy to Netlify
npm run deploy:netlify
```

## Performance Targets

The build is optimized to meet these performance targets:

### Bundle Size

- **Main Bundle**: < 100KB gzipped
- **Total JavaScript**: < 200KB gzipped
- **Total CSS**: < 20KB gzipped
- **Total Assets**: < 300KB gzipped

### Loading Performance

- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.8s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms

### Lighthouse Score

- **Performance**: > 90
- **Accessibility**: > 95
- **Best Practices**: > 90
- **SEO**: > 90

## Build Optimization Features

### Terser Configuration

The build uses Terser with these optimizations:

```javascript
terserOptions: {
  compress: {
    drop_console: true,        // Remove console.log
    drop_debugger: true,       // Remove debugger statements
    pure_funcs: [              // Remove specific function calls
      'console.log',
      'console.info',
      'console.debug'
    ],
  },
  format: {
    comments: false,           // Remove all comments
  },
}
```

### Rollup Configuration

Manual chunk splitting for optimal caching:

```javascript
manualChunks: (id) => {
  if (id.includes('node_modules')) {
    if (id.includes('react')) return 'react-vendor';
    if (id.includes('leaflet')) return 'map-vendor';
    if (id.includes('react-aria')) return 'aria-vendor';
    return 'vendor';
  }
  if (id.includes('/components/')) return 'components';
  if (id.includes('/services/')) return 'services';
}
```

## Troubleshooting

### Build Fails

**Problem**: Build fails with TypeScript errors

**Solution**:
```bash
# Check for type errors
npm run type-check

# Fix errors and rebuild
npm run build:prod
```

**Problem**: Build fails with memory errors

**Solution**:
```bash
# Increase Node.js memory limit
NODE_OPTIONS=--max-old-space-size=4096 npm run build:prod
```

### Large Bundle Size

**Problem**: Bundle size exceeds targets

**Solution**:
```bash
# Analyze bundle composition
npm run analyze

# Check for large dependencies
npm list --depth=0

# Consider alternatives or lazy loading
```

### Slow Build Times

**Problem**: Build takes too long

**Solution**:
1. Clear cache: `rm -rf node_modules/.vite`
2. Update dependencies: `npm update`
3. Check for circular dependencies
4. Disable source maps in production

### Environment Variables Not Working

**Problem**: Environment variables are undefined

**Solution**:
1. Ensure variables start with `VITE_`
2. Restart dev server after changing .env files
3. Check that .env file is in project root
4. Verify variable names match exactly

### Assets Not Loading

**Problem**: Assets return 404 errors

**Solution**:
1. Check asset paths are relative
2. Verify assets are in `public/` or `src/assets/`
3. Check base URL in vite.config.ts
4. Ensure assets are not in .gitignore

## Pre-Deployment Checklist

Before deploying to production, run:

```bash
npm run pre-deploy
```

This checks:
- ✅ All required files exist
- ✅ Environment variables are configured
- ✅ Mock data is disabled in production
- ✅ TypeScript compiles without errors
- ✅ All tests pass
- ✅ Build configuration is optimized
- ✅ Deployment configuration exists
- ✅ .gitignore is properly configured

## Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [Vite Build Optimizations](https://vitejs.dev/guide/build.html)
- [Rollup Options](https://rollupjs.org/guide/en/#big-list-of-options)
- [Terser Options](https://terser.org/docs/api-reference)
- [Web Performance Best Practices](https://web.dev/performance/)

## Next Steps

After building:

1. **Test Locally**: Run `npm run preview` to test the production build
2. **Run Checks**: Run `npm run pre-deploy` to verify everything is ready
3. **Deploy**: Use your chosen deployment platform (see [DEPLOYMENT.md](./DEPLOYMENT.md))
4. **Monitor**: Set up monitoring and error tracking
5. **Optimize**: Use Lighthouse to identify further optimizations
