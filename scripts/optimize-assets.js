#!/usr/bin/env node

/**
 * Asset Optimization Script
 * 
 * This script optimizes images and other assets for production deployment.
 * Run with: node scripts/optimize-assets.js
 */

import { readdir, stat, copyFile, mkdir } from 'fs/promises';
import { join, extname, basename } from 'path';
import { existsSync } from 'fs';

const ASSET_DIRS = [
  'src/assets',
  'public',
];

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.svg'];

async function getAllFiles(dir, fileList = []) {
  try {
    const files = await readdir(dir);
    
    for (const file of files) {
      const filePath = join(dir, file);
      const fileStat = await stat(filePath);
      
      if (fileStat.isDirectory()) {
        await getAllFiles(filePath, fileList);
      } else {
        fileList.push(filePath);
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read directory ${dir}:`, error.message);
  }
  
  return fileList;
}

async function analyzeAssets() {
  console.log('🔍 Analyzing assets...\n');
  
  const stats = {
    totalFiles: 0,
    totalSize: 0,
    images: [],
    fonts: [],
    other: [],
  };
  
  for (const dir of ASSET_DIRS) {
    if (!existsSync(dir)) {
      console.log(`⚠️  Directory ${dir} does not exist, skipping...`);
      continue;
    }
    
    const files = await getAllFiles(dir);
    
    for (const file of files) {
      const fileStat = await stat(file);
      const ext = extname(file).toLowerCase();
      const size = fileStat.size;
      
      stats.totalFiles++;
      stats.totalSize += size;
      
      const fileInfo = {
        path: file,
        size: size,
        sizeKB: (size / 1024).toFixed(2),
      };
      
      if (IMAGE_EXTENSIONS.includes(ext)) {
        stats.images.push(fileInfo);
      } else if (['.woff', '.woff2', '.ttf', '.otf'].includes(ext)) {
        stats.fonts.push(fileInfo);
      } else {
        stats.other.push(fileInfo);
      }
    }
  }
  
  return stats;
}

function printReport(stats) {
  console.log('📊 Asset Analysis Report\n');
  console.log('═'.repeat(60));
  console.log(`Total Files: ${stats.totalFiles}`);
  console.log(`Total Size: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log('═'.repeat(60));
  
  if (stats.images.length > 0) {
    console.log('\n📷 Images:');
    stats.images.forEach(img => {
      const warning = img.size > 100 * 1024 ? ' ⚠️  (Large file)' : '';
      console.log(`  - ${img.path} (${img.sizeKB} KB)${warning}`);
    });
  }
  
  if (stats.fonts.length > 0) {
    console.log('\n🔤 Fonts:');
    stats.fonts.forEach(font => {
      console.log(`  - ${font.path} (${font.sizeKB} KB)`);
    });
  }
  
  if (stats.other.length > 0) {
    console.log('\n📄 Other Assets:');
    stats.other.forEach(file => {
      console.log(`  - ${file.path} (${file.sizeKB} KB)`);
    });
  }
  
  console.log('\n💡 Optimization Recommendations:\n');
  
  const largeImages = stats.images.filter(img => img.size > 100 * 1024);
  if (largeImages.length > 0) {
    console.log('  • Consider compressing these large images:');
    largeImages.forEach(img => {
      console.log(`    - ${img.path} (${img.sizeKB} KB)`);
    });
    console.log('    Use tools like: imagemin, squoosh, or tinypng.com\n');
  }
  
  const nonWebP = stats.images.filter(img => 
    !['.webp', '.svg'].includes(extname(img.path).toLowerCase())
  );
  if (nonWebP.length > 0) {
    console.log('  • Consider converting to WebP format for better compression:');
    nonWebP.forEach(img => {
      console.log(`    - ${img.path}`);
    });
    console.log('    Use: cwebp or online converters\n');
  }
  
  const largeFonts = stats.fonts.filter(font => font.size > 50 * 1024);
  if (largeFonts.length > 0) {
    console.log('  • Consider subsetting these fonts:');
    largeFonts.forEach(font => {
      console.log(`    - ${font.path} (${font.sizeKB} KB)`);
    });
    console.log('    Use: glyphhanger or fonttools\n');
  }
  
  if (stats.images.length === 0 && stats.fonts.length === 0) {
    console.log('  ✅ No assets found to optimize. Using system fonts and minimal assets.');
  }
  
  console.log('═'.repeat(60));
}

async function main() {
  console.log('🚀 Asset Optimization Tool\n');
  
  try {
    const stats = await analyzeAssets();
    printReport(stats);
    
    console.log('\n✅ Analysis complete!');
    console.log('\nFor production builds, assets are automatically optimized by Vite.');
    console.log('Run "npm run build" to create an optimized production build.\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
