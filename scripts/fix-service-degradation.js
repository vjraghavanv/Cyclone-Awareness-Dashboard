#!/usr/bin/env node

/**
 * Service Degradation Fix Script
 * 
 * Automatically fixes common service degradation issues
 */

import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';

console.log('🔧 Service Degradation Fix Script\n');

async function checkNodeVersion() {
  const version = process.version;
  const major = parseInt(version.slice(1).split('.')[0]);
  const minor = parseInt(version.split('.')[1]);
  
  console.log(`📌 Current Node.js version: ${version}`);
  
  if (major < 20 || (major === 20 && minor < 19)) {
    console.log('❌ Node.js version is too old for Vite 7.2.4');
    console.log('⚠️  Required: Node.js 20.19+ or 22.12+');
    console.log('\n💡 Solutions:');
    console.log('   1. Upgrade Node.js: https://nodejs.org/');
    console.log('   2. Or downgrade Vite: npm install vite@5.4.11 --save-dev');
    return false;
  } else {
    console.log('✅ Node.js version is compatible\n');
    return true;
  }
}

async function fixEnvironmentFile() {
  console.log('🔍 Checking .env.development file...');
  
  if (!existsSync('.env.development')) {
    console.log('❌ .env.development not found');
    return false;
  }
  
  try {
    let content = await readFile('.env.development', 'utf-8');
    let modified = false;
    
    // Ensure mock data is enabled
    if (!content.includes('VITE_ENABLE_MOCK_DATA=true')) {
      if (content.includes('VITE_ENABLE_MOCK_DATA=false')) {
        content = content.replace('VITE_ENABLE_MOCK_DATA=false', 'VITE_ENABLE_MOCK_DATA=true');
        modified = true;
        console.log('✅ Enabled mock data in development');
      }
    } else {
      console.log('✅ Mock data already enabled');
    }
    
    // Add health check disable flag if not present
    if (!content.includes('VITE_ENABLE_HEALTH_CHECKS')) {
      content += '\n# Disable health checks in development\nVITE_ENABLE_HEALTH_CHECKS=false\n';
      modified = true;
      console.log('✅ Disabled health checks in development');
    }
    
    if (modified) {
      await writeFile('.env.development', content, 'utf-8');
      console.log('✅ Updated .env.development\n');
    } else {
      console.log('✅ .env.development is already configured correctly\n');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error updating .env.development:', error.message);
    return false;
  }
}

async function fixDataContext() {
  console.log('🔍 Checking DataContext.tsx...');
  
  const filePath = 'src/contexts/DataContext.tsx';
  
  if (!existsSync(filePath)) {
    console.log('❌ DataContext.tsx not found');
    return false;
  }
  
  try {
    let content = await readFile(filePath, 'utf-8');
    
    // Check if health check already has mock data handling
    if (content.includes('environment.enableMockData') && content.includes('checkHealth')) {
      console.log('✅ DataContext already has mock data handling for health checks\n');
      return true;
    }
    
    // Check if we need to import environment
    if (!content.includes("import { environment }")) {
      console.log('⚠️  DataContext needs manual update to import environment config');
      console.log('   Add this import: import { environment } from \'../config/environment\';');
    }
    
    console.log('⚠️  DataContext may need manual update for health check handling');
    console.log('   See SERVICE-DEGRADATION-FIX.md for details\n');
    
    return true;
  } catch (error) {
    console.error('❌ Error checking DataContext:', error.message);
    return false;
  }
}

async function provideSummary() {
  console.log('═'.repeat(60));
  console.log('📋 Summary\n');
  
  const nodeOk = await checkNodeVersion();
  const envOk = await fixEnvironmentFile();
  const contextOk = await fixDataContext();
  
  console.log('═'.repeat(60));
  console.log('\n🎯 Next Steps:\n');
  
  if (!nodeOk) {
    console.log('1. ⚠️  CRITICAL: Upgrade Node.js to 20.19+ or 22.12+');
    console.log('   Download from: https://nodejs.org/\n');
  }
  
  if (envOk) {
    console.log('2. ✅ Environment configured correctly');
  } else {
    console.log('2. ❌ Fix .env.development manually');
  }
  
  console.log('\n3. Restart your development server:');
  console.log('   npm run dev\n');
  
  console.log('4. Check browser console for any remaining errors\n');
  
  console.log('📖 For more details, see: SERVICE-DEGRADATION-FIX.md\n');
}

async function main() {
  try {
    await provideSummary();
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

main();
