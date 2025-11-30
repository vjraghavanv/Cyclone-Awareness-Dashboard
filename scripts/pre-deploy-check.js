#!/usr/bin/env node

/**
 * Pre-Deployment Checklist Script
 * 
 * Runs various checks before deployment to ensure the application is ready.
 * Run with: node scripts/pre-deploy-check.js
 */

import { readFile, access } from 'fs/promises';
import { existsSync } from 'fs';
import { execSync } from 'child_process';

const REQUIRED_FILES = [
  'package.json',
  'vite.config.ts',
  'tsconfig.json',
  '.env.example',
  '.env.production',
  'src/main.tsx',
  'src/App.tsx',
  'index.html',
];

const REQUIRED_ENV_VARS = [
  'VITE_API_BASE_URL',
  'VITE_ENABLE_MOCK_DATA',
  'VITE_LOG_LEVEL',
];

let checksPassed = 0;
let checksFailed = 0;

function logSuccess(message) {
  console.log(`✅ ${message}`);
  checksPassed++;
}

function logError(message) {
  console.log(`❌ ${message}`);
  checksFailed++;
}

function logWarning(message) {
  console.log(`⚠️  ${message}`);
}

function logInfo(message) {
  console.log(`ℹ️  ${message}`);
}

async function checkRequiredFiles() {
  console.log('\n📁 Checking required files...');
  
  for (const file of REQUIRED_FILES) {
    if (existsSync(file)) {
      logSuccess(`Found ${file}`);
    } else {
      logError(`Missing ${file}`);
    }
  }
}

async function checkEnvironmentVariables() {
  console.log('\n🔐 Checking environment variables...');
  
  try {
    const envContent = await readFile('.env.production', 'utf-8');
    
    for (const varName of REQUIRED_ENV_VARS) {
      if (envContent.includes(varName)) {
        logSuccess(`${varName} is defined`);
      } else {
        logError(`${varName} is missing in .env.production`);
      }
    }
    
    // Check for mock data in production
    if (envContent.includes('VITE_ENABLE_MOCK_DATA=true')) {
      logWarning('Mock data is enabled in production! Set VITE_ENABLE_MOCK_DATA=false');
    } else {
      logSuccess('Mock data is disabled in production');
    }
    
    // Check log level
    if (envContent.includes('VITE_LOG_LEVEL=debug')) {
      logWarning('Debug logging is enabled in production! Consider using "error" or "warn"');
    } else {
      logSuccess('Production log level is appropriate');
    }
  } catch (error) {
    logError(`Could not read .env.production: ${error.message}`);
  }
}

async function checkPackageJson() {
  console.log('\n📦 Checking package.json...');
  
  try {
    const packageJson = JSON.parse(await readFile('package.json', 'utf-8'));
    
    if (packageJson.scripts.build) {
      logSuccess('Build script is defined');
    } else {
      logError('Build script is missing');
    }
    
    if (packageJson.scripts['build:prod']) {
      logSuccess('Production build script is defined');
    } else {
      logWarning('Production build script is missing (optional)');
    }
    
    if (packageJson.scripts.test) {
      logSuccess('Test script is defined');
    } else {
      logWarning('Test script is missing');
    }
    
    // Check for required dependencies
    const requiredDeps = ['react', 'react-dom', 'vite'];
    for (const dep of requiredDeps) {
      if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
        logSuccess(`${dep} is installed`);
      } else {
        logError(`${dep} is missing`);
      }
    }
  } catch (error) {
    logError(`Could not read package.json: ${error.message}`);
  }
}

async function checkTypeScript() {
  console.log('\n🔷 Running TypeScript type check...');
  
  try {
    execSync('npm run type-check', { stdio: 'pipe' });
    logSuccess('TypeScript type check passed');
  } catch (error) {
    logError('TypeScript type check failed');
    logInfo('Run "npm run type-check" to see errors');
  }
}

async function checkTests() {
  console.log('\n🧪 Running tests...');
  
  try {
    execSync('npm run test -- --run', { stdio: 'pipe' });
    logSuccess('All tests passed');
  } catch (error) {
    logError('Some tests failed');
    logInfo('Run "npm run test" to see failures');
  }
}

async function checkBuildSize() {
  console.log('\n📊 Checking build configuration...');
  
  try {
    const viteConfig = await readFile('vite.config.ts', 'utf-8');
    
    if (viteConfig.includes('minify')) {
      logSuccess('Minification is enabled');
    } else {
      logWarning('Minification might not be enabled');
    }
    
    if (viteConfig.includes('manualChunks')) {
      logSuccess('Code splitting is configured');
    } else {
      logWarning('Code splitting might not be configured');
    }
    
    if (viteConfig.includes('terserOptions')) {
      logSuccess('Terser optimization is configured');
    } else {
      logInfo('Terser options not customized (using defaults)');
    }
  } catch (error) {
    logError(`Could not read vite.config.ts: ${error.message}`);
  }
}

async function checkDeploymentConfig() {
  console.log('\n🚀 Checking deployment configuration...');
  
  const deploymentFiles = [
    { file: 'vercel.json', platform: 'Vercel' },
    { file: 'netlify.toml', platform: 'Netlify' },
    { file: '.github/workflows/deploy.yml', platform: 'GitHub Pages' },
  ];
  
  let hasDeploymentConfig = false;
  
  for (const { file, platform } of deploymentFiles) {
    if (existsSync(file)) {
      logSuccess(`${platform} configuration found (${file})`);
      hasDeploymentConfig = true;
    }
  }
  
  if (!hasDeploymentConfig) {
    logWarning('No deployment configuration found');
    logInfo('Consider adding vercel.json, netlify.toml, or GitHub Actions workflow');
  }
}

async function checkGitIgnore() {
  console.log('\n🙈 Checking .gitignore...');
  
  try {
    const gitignore = await readFile('.gitignore', 'utf-8');
    
    const requiredEntries = [
      'node_modules',
      'dist',
      '.env',
      '.env.local',
    ];
    
    for (const entry of requiredEntries) {
      if (gitignore.includes(entry)) {
        logSuccess(`${entry} is ignored`);
      } else {
        logError(`${entry} is not in .gitignore`);
      }
    }
    
    // Check that .env.example is NOT ignored
    if (!gitignore.includes('!.env.example')) {
      logWarning('.env.example might be ignored (should be committed)');
    }
  } catch (error) {
    logError(`Could not read .gitignore: ${error.message}`);
  }
}

async function printSummary() {
  console.log('\n' + '═'.repeat(60));
  console.log('📋 Pre-Deployment Check Summary');
  console.log('═'.repeat(60));
  console.log(`✅ Checks Passed: ${checksPassed}`);
  console.log(`❌ Checks Failed: ${checksFailed}`);
  console.log('═'.repeat(60));
  
  if (checksFailed === 0) {
    console.log('\n🎉 All checks passed! Ready for deployment.');
    console.log('\nNext steps:');
    console.log('  1. Run "npm run build:prod" to create production build');
    console.log('  2. Test the build with "npm run preview"');
    console.log('  3. Deploy to your chosen platform');
  } else {
    console.log('\n⚠️  Some checks failed. Please fix the issues before deploying.');
    console.log('\nRecommended actions:');
    console.log('  1. Review the failed checks above');
    console.log('  2. Fix any missing files or configuration');
    console.log('  3. Run this script again to verify');
  }
  
  console.log('\n');
}

async function main() {
  console.log('🔍 Pre-Deployment Checklist\n');
  console.log('This script checks if your application is ready for deployment.\n');
  
  try {
    await checkRequiredFiles();
    await checkEnvironmentVariables();
    await checkPackageJson();
    await checkGitIgnore();
    await checkDeploymentConfig();
    await checkBuildSize();
    await checkTypeScript();
    await checkTests();
    await printSummary();
    
    process.exit(checksFailed > 0 ? 1 : 0);
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

main();
