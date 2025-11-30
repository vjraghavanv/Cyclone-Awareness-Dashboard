# Performance Optimization Guide

This document outlines performance optimization strategies for the Cyclone Awareness Dashboard.

## Build Optimizations

### Code Splitting

The application uses automatic code splitting via Vite:

- **React Vendor Bundle**: React and React-DOM are bundled separately
- **Map Vendor Bundle**: Leaflet is bundled separately
- **Route-based Splitting**: Components are loaded on demand

### Minification

- JavaScript minification using Terser
- CSS minification enabled
- HTML minification in production

### Tree Shaking

Vite automatically removes unused code during production builds.

## Asset Optimization

### Images

1. **Use WebP format** for better compression:
   ```bash
   # Convert PNG to WebP
   cwebp input.png -o output.webp
   ```

2. **Optimize existing images**:
   ```bash
   # Install imagemin
   npm install -g imagemin-cli imagemin-webp
   
   # Optimize images
   imagemin src/assets/*.{jpg,png} --out-dir=src/assets/optimized --plugin=webp
   ```

3. **Use appropriate sizes**:
   - Icons: 24x24, 32x32, 48x48
   - Thumbnails: 150x150
   - Hero images: 1920x1080 (max)

### Fonts

Currently using system fonts for optimal performance. If custom fonts are needed:

1. Use WOFF2 format
2. Subset fonts to include only needed characters
3. Use `font-display: swap` for better perceived performance

### CSS

- TailwindCSS automatically purges unused styles
- Critical CSS is inlined in production
- Non-critical CSS is loaded asynchronously

## Runtime Optimizations

### React Performance

1. **Memoization**:
   ```typescript
   // Use useMemo for expensive calculations
   const expensiveValue = useMemo(() => calculateValue(data), [data]);
   
   // Use useCallback for event handlers
   const handleClick = useCallback(() => {
     // handler logic
   }, [dependencies]);
   ```

2. **Component Splitting**:
   - Large components are split into smaller ones
   - Use React.lazy() for code splitting

3. **Virtual Scrolling**:
   - Consider implementing for long lists (districts, updates)

### Caching Strategy

The application implements a multi-layer caching strategy:

1. **Memory Cache**: Fast access to frequently used data
2. **Local Storage**: Persistent cache across sessions
3. **Service Worker**: (Future enhancement) Offline support

### API Optimization

1. **Request Batching**: Combine multiple API calls when possible
2. **Rate Limiting**: Prevent excessive API calls
3. **Stale-While-Revalidate**: Show cached data while fetching fresh data

## Network Optimizations

### Compression

Enable compression on your server:

**Nginx**:
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
gzip_min_length 1000;
```

**Apache**:
```apache
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>
```

### HTTP/2

Enable HTTP/2 on your server for:
- Multiplexing
- Server push
- Header compression

### CDN

Use a CDN for static assets:
- Cloudflare
- AWS CloudFront
- Vercel Edge Network

## Monitoring

### Performance Metrics

Track these key metrics:

1. **First Contentful Paint (FCP)**: < 1.8s
2. **Largest Contentful Paint (LCP)**: < 2.5s
3. **Time to Interactive (TTI)**: < 3.8s
4. **Cumulative Layout Shift (CLS)**: < 0.1
5. **First Input Delay (FID)**: < 100ms

### Tools

- **Lighthouse**: Built into Chrome DevTools
- **WebPageTest**: Detailed performance analysis
- **Chrome DevTools Performance Tab**: Runtime performance profiling

### Monitoring Setup

```bash
# Run Lighthouse
npm install -g lighthouse
lighthouse https://your-domain.com --view

# Run bundle analysis
npm run analyze
```

## Best Practices

### Loading Strategy

1. **Critical Resources**: Load synchronously
   - HTML
   - Critical CSS
   - Core JavaScript

2. **Non-Critical Resources**: Load asynchronously
   - Analytics
   - Third-party scripts
   - Non-critical CSS

3. **Lazy Loading**: Load on demand
   - Images below the fold
   - Route components
   - Heavy libraries

### Code Best Practices

1. **Avoid Large Dependencies**: Check bundle size before adding libraries
2. **Use Native APIs**: Prefer native browser APIs over libraries
3. **Debounce/Throttle**: Limit expensive operations
4. **Avoid Memory Leaks**: Clean up event listeners and timers

### Example: Debouncing

```typescript
import { useCallback, useRef } from 'react';

function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}
```

## Checklist

Before deploying to production:

- [ ] Run production build and check bundle size
- [ ] Test on slow 3G network
- [ ] Test on low-end devices
- [ ] Run Lighthouse audit (score > 90)
- [ ] Verify all images are optimized
- [ ] Check for console errors/warnings
- [ ] Verify caching headers are set
- [ ] Test offline functionality
- [ ] Verify lazy loading works
- [ ] Check memory usage (no leaks)

## Future Enhancements

1. **Service Worker**: Offline support and background sync
2. **Progressive Web App**: Add to home screen, push notifications
3. **Image Lazy Loading**: Native lazy loading for images
4. **Prefetching**: Prefetch likely next pages
5. **Resource Hints**: Use preload, prefetch, preconnect
