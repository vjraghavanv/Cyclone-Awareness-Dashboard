# Quick Start Guide

Get the Cyclone Awareness Dashboard up and running in minutes.

## Prerequisites

- Node.js 20.19+ or 22.12+ (check with `node --version`)
- npm or yarn package manager
- Git (for version control)

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd cyclone-awareness-dashboard

# Install dependencies
npm install
```

## Development

```bash
# Start development server (http://localhost:5173)
npm run dev
```

The application will open in your browser with hot module replacement enabled.

## Configuration

1. Copy environment template:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` with your settings:
   ```bash
   VITE_API_BASE_URL=http://localhost:3000
   VITE_ENABLE_MOCK_DATA=true
   ```

## Testing

```bash
# Run all tests
npm run test

# Run property-based tests
npm run test:properties

# Run tests with coverage
npm run test:coverage

# Run tests in UI mode
npm run test:ui
```

## Building for Production

```bash
# Run pre-deployment checks
npm run pre-deploy

# Build for production
npm run build:prod

# Preview production build locally
npm run preview
```

## Deployment

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
npm run deploy:vercel
```

Or use the Vercel dashboard:
1. Import your Git repository
2. Vercel auto-detects Vite configuration
3. Add environment variables in dashboard
4. Deploy!

### Option 2: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
npm run deploy:netlify
```

Or use the Netlify dashboard:
1. Connect your Git repository
2. Build command: `npm run build:prod`
3. Publish directory: `dist`
4. Add environment variables
5. Deploy!

### Option 3: GitHub Pages

1. Enable GitHub Pages in repository settings
2. Push to main branch
3. GitHub Actions automatically builds and deploys

## Common Tasks

### Add a New Component

```bash
# Create component directory
mkdir src/components/MyComponent

# Create component file
touch src/components/MyComponent/index.tsx
```

### Add Environment Variable

1. Add to `.env.example`:
   ```bash
   VITE_MY_VARIABLE=default_value
   ```

2. Add to `.env.development` and `.env.production`

3. Update `src/config/environment.ts`:
   ```typescript
   export interface EnvironmentConfig {
     // ... existing config
     myVariable: string;
   }

   export const environment: EnvironmentConfig = {
     // ... existing config
     myVariable: getEnvVar('VITE_MY_VARIABLE', 'default'),
   };
   ```

### Run Linting

```bash
# Check for linting errors
npm run lint

# Auto-fix linting errors
npm run lint -- --fix
```

### Analyze Bundle Size

```bash
# Build and analyze bundle
npm run analyze
```

This opens a visual report showing bundle composition.

### Optimize Assets

```bash
# Analyze asset sizes and get recommendations
npm run optimize-assets
```

## Troubleshooting

### Port Already in Use

If port 5173 is already in use:

```bash
# Use a different port
npm run dev -- --port 3000
```

### Build Fails

```bash
# Clear cache and rebuild
rm -rf node_modules/.vite
npm run build:prod
```

### Tests Fail

```bash
# Run tests in watch mode to debug
npm run test -- --watch

# Run specific test file
npm run test -- src/components/MyComponent.test.tsx
```

### Environment Variables Not Working

1. Ensure variables start with `VITE_`
2. Restart dev server after changing .env files
3. Check that .env file is in project root

## Project Structure

```
cyclone-awareness-dashboard/
├── src/
│   ├── components/       # React components
│   ├── contexts/         # React contexts
│   ├── services/         # Business logic
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   ├── hooks/           # Custom hooks
│   ├── config/          # Configuration
│   └── styles/          # Global styles
├── tests/
│   ├── unit/            # Unit tests
│   └── properties/      # Property-based tests
├── public/              # Static assets
├── scripts/             # Build scripts
└── dist/                # Production build (generated)
```

## Key Files

- `vite.config.ts` - Vite configuration
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - TailwindCSS configuration
- `package.json` - Dependencies and scripts
- `.env.example` - Environment variable template
- `vercel.json` - Vercel deployment config
- `netlify.toml` - Netlify deployment config

## Performance Tips

1. **Use React DevTools** to identify slow components
2. **Enable production mode** when testing performance
3. **Use Lighthouse** to audit performance
4. **Monitor bundle size** with `npm run analyze`
5. **Lazy load** heavy components when possible

## Security Best Practices

1. Never commit `.env.local` or `.env` files
2. Use environment variables for sensitive data
3. Keep dependencies updated: `npm update`
4. Review security advisories: `npm audit`
5. Use HTTPS in production

## Getting Help

- Check [BUILD.md](./BUILD.md) for build configuration
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment details
- Check [OPTIMIZATION.md](./OPTIMIZATION.md) for performance tips
- Check [ACCESSIBILITY.md](./ACCESSIBILITY.md) for accessibility guidelines

## Next Steps

1. ✅ Install dependencies
2. ✅ Start development server
3. ✅ Make your changes
4. ✅ Run tests
5. ✅ Build for production
6. ✅ Deploy!

Happy coding! 🚀
