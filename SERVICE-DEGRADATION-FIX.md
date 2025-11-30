# Service Degradation Fix Guide

## Issue Identified

The "service degradation" you're experiencing is caused by:

1. **Node.js Version Mismatch**: You're using Node.js 20.8.1, but Vite 7.2.4 requires 20.19+ or 22.12+
2. **Health Check Failures**: The health check is trying to call non-existent endpoints
3. **Mock Data Configuration**: Mock data might not be properly enabled in development

## Solutions

### Solution 1: Upgrade Node.js (Recommended)

**Windows:**
1. Download Node.js 20.19+ or 22.12+ from https://nodejs.org/
2. Run the installer
3. Restart your terminal
4. Verify: `node --version`

**Using nvm (Node Version Manager):**
```bash
# Install nvm from https://github.com/coreybutler/nvm-windows
nvm install 22.12.0
nvm use 22.12.0
node --version
```

### Solution 2: Downgrade Vite (Temporary Fix)

If you can't upgrade Node.js immediately:

```bash
npm install vite@5.4.11 --save-dev
```

Then rebuild:
```bash
npm run build:prod
```

### Solution 3: Fix Health Check Implementation

The health check is calling endpoints that don't exist. Here's the fix:

#### Option A: Disable Health Checks in Development

Update `.env.development`:
```bash
VITE_ENABLE_HEALTH_CHECKS=false
```

#### Option B: Fix the Health Check Logic

Update `src/contexts/DataContext.tsx` to handle mock data properly:

```typescript
const checkHealth = useCallback(async () => {
  // Skip health checks if using mock data
  if (environment.enableMockData) {
    const mockStatus: Record<string, boolean> = {
      '/cyclone/current': true,
      '/rainfall/districts': true,
      '/alerts/govt': true,
      '/bulletins/imd': true,
      '/holiday/prediction': true,
      '/risk/summary': true,
    };
    setHealthStatus(mockStatus);
    return;
  }

  try {
    const endpoints = [
      '/cyclone/current',
      '/rainfall/districts',
      '/alerts/govt',
      '/bulletins/imd',
      '/holiday/prediction',
      '/risk/summary',
    ];

    const healthChecks = await Promise.allSettled(
      endpoints.map(async (endpoint) => ({
        endpoint,
        healthy: await apiClient.healthCheck(endpoint),
      }))
    );

    const status: Record<string, boolean> = {};
    healthChecks.forEach((result) => {
      if (result.status === 'fulfilled') {
        status[result.value.endpoint] = result.value.healthy;
      } else {
        status['unknown'] = false;
      }
    });

    setHealthStatus(status);
  } catch (err) {
    console.error('Error checking health:', err);
  }
}, []);
```

### Solution 4: Ensure Mock Data is Enabled

Check your `.env.development` file:

```bash
# Should be set to true for development
VITE_ENABLE_MOCK_DATA=true
```

Then restart the dev server:
```bash
npm run dev
```

## Quick Fix Script

I'll create a script to automatically apply these fixes:

```bash
# Run this command
node scripts/fix-service-degradation.js
```

## Verification Steps

After applying fixes:

1. **Check Node version:**
   ```bash
   node --version
   # Should show 20.19+ or 22.12+
   ```

2. **Verify environment:**
   ```bash
   cat .env.development
   # Should show VITE_ENABLE_MOCK_DATA=true
   ```

3. **Start dev server:**
   ```bash
   npm run dev
   ```

4. **Check browser console:**
   - Should see mock data being used
   - No health check errors
   - No service degradation warnings

## Understanding the Issue

### Why Health Checks Fail

The health check tries to call:
- `/cyclone/current/health`
- `/rainfall/districts/health`
- etc.

But these endpoints don't exist in your mock API. The fix is to:
1. Skip health checks when using mock data
2. Or implement proper health check endpoints
3. Or use a different health check strategy

### Why Mock Data Matters

In development:
- Mock data = No real API calls
- No API calls = No health check failures
- No failures = No service degradation

## Recommended Approach

**For Development:**
1. Upgrade Node.js to 22.12+ (best long-term solution)
2. Ensure `VITE_ENABLE_MOCK_DATA=true` in `.env.development`
3. Skip health checks when using mock data

**For Production:**
1. Set `VITE_ENABLE_MOCK_DATA=false`
2. Implement proper health check endpoints on your API
3. Or remove health checks if not needed

## Additional Troubleshooting

### If dev server still won't start:

```bash
# Clear cache
rm -rf node_modules/.vite
rm -rf dist

# Reinstall dependencies
npm install

# Try again
npm run dev
```

### If you see "crypto.hash is not a function":

This is the Node.js version issue. You MUST upgrade to Node.js 20.19+ or 22.12+.

### If you see health check warnings:

Add this to your `.env.development`:
```bash
VITE_ENABLE_HEALTH_CHECKS=false
```

## Next Steps

1. Choose a solution above
2. Apply the fix
3. Restart your dev server
4. Verify everything works
5. Continue development!

## Need More Help?

If issues persist:
1. Check the browser console for specific errors
2. Check the terminal for build errors
3. Verify all environment variables are set correctly
4. Ensure mock data generator is working
