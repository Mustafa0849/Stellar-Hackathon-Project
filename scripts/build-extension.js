const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const OUT_DIR = path.join(__dirname, '..', 'out'); // Next.js builds here
const DIST_DIR = path.join(__dirname, '..', 'dist'); // Final extension package
const NEXT_DIR = path.join(DIST_DIR, '_next');
const RENAMED_NEXT_DIR = path.join(DIST_DIR, 'next');
const ASSETS_DIR = path.join(DIST_DIR, 'assets');
const SOURCE_MANIFEST = path.join(__dirname, '..', 'public', 'manifest.json');
const TARGET_MANIFEST = path.join(DIST_DIR, 'manifest.json');

/**
 * Recursively find all HTML files in a directory
 */
function findHtmlFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) {
    return fileList;
  }

  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findHtmlFiles(filePath, fileList);
    } else if (file.endsWith('.html')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Recursively find all JS files in a directory
 */
function findJsFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) {
    return fileList;
  }

  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findJsFiles(filePath, fileList);
    } else if (file.endsWith('.js')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Calculate relative path from a file's directory to the root of dist directory
 */
function getRelativePathToRoot(filePath) {
  const fileDir = path.dirname(filePath);
  const relativePath = path.relative(fileDir, DIST_DIR);
  
  if (relativePath === '' || relativePath === '.') {
    return './';
  }
  
  const normalized = relativePath.split(path.sep).join('/');
  return normalized.endsWith('/') ? normalized : normalized + '/';
}

/**
 * Replace absolute paths with relative paths in content
 */
function convertAbsoluteToRelative(content, relativeToRoot) {
  let updated = content;

  // Step 1: Replace /_next/ with /next/ (folder rename)
  updated = updated.replace(/\/_next\//g, '/next/');
  updated = updated.replace(/"_next\//g, '"next/');
  updated = updated.replace(/'_next\//g, "'next/");
  updated = updated.replace(/\(_next\//g, '(next/');
  updated = updated.replace(/\/_next"/g, '/next"');
  updated = updated.replace(/\/_next'/g, "/next'");
  updated = updated.replace(/\/_next\)/g, '/next)');

  // Step 2: Convert absolute paths to relative paths
  // Match patterns in various contexts: quotes, src=, href=, url(), import, etc.
  // Avoid replacing URLs (http://, https://) and data URIs (data:)
  
  // Replace "/next/" with relative path
  updated = updated.replace(/(["'`]|src=["']|href=["']|url\(["']?)\/next\//g, (match, prefix) => {
    // Don't replace if it's part of a URL
    if (match.includes('http://') || match.includes('https://') || match.includes('data:')) {
      return match;
    }
    return prefix + relativeToRoot + 'next/';
  });

  // Replace "/assets/" with relative path
  updated = updated.replace(/(["'`]|src=["']|href=["']|url\(["']?)\/assets\//g, (match, prefix) => {
    if (match.includes('http://') || match.includes('https://') || match.includes('data:')) {
      return match;
    }
    return prefix + relativeToRoot + 'assets/';
  });

  // Replace route paths like "/dashboard/", "/login/", etc.
  updated = updated.replace(/(["'`]|src=["']|href=["']|url\(["']?)\/(dashboard|login|create|import|create-password|onboarding)\//g, (match, prefix, route) => {
    if (match.includes('http://') || match.includes('https://') || match.includes('data:')) {
      return match;
    }
    return prefix + relativeToRoot + route + '/';
  });

  // Replace root-level absolute paths (standalone "/" followed by known paths)
  updated = updated.replace(/(["'`]|src=["']|href=["']|url\(["']?)\/(?=next\/|assets\/|dashboard\/|login\/|create\/|import\/|create-password\/|onboarding\/|index\.html)/g, (match, prefix) => {
    if (match.includes('http://') || match.includes('https://') || match.includes('data:')) {
      return match;
    }
    return prefix + relativeToRoot;
  });

  return updated;
}

/**
 * Process a single file to convert absolute paths to relative paths
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativeToRoot = getRelativePathToRoot(filePath);
    const updated = convertAbsoluteToRelative(content, relativeToRoot);

    if (content !== updated) {
      fs.writeFileSync(filePath, updated, 'utf8');
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Generate a hash-based filename for script content
 */
function generateScriptFilename(content) {
  const hash = crypto.createHash('sha256').update(content).digest('hex');
  return `inline-${hash.substring(0, 8)}.js`;
}

/**
 * Extract inline scripts from HTML and save them as external files
 */
function extractInlineScripts(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let scriptCounter = 0;
    let hasChanges = false;

    // Ensure assets directory exists
    if (!fs.existsSync(ASSETS_DIR)) {
      fs.mkdirSync(ASSETS_DIR, { recursive: true });
    }

    // Regex to match inline script tags (those without src attribute)
    const inlineScriptRegex = /<script(?![^>]*\ssrc=)([^>]*)>([\s\S]*?)<\/script>/gi;
    
    content = content.replace(inlineScriptRegex, (match, attributes, scriptContent) => {
      const trimmedContent = scriptContent.trim();
      if (!trimmedContent) {
        return match;
      }

      // Generate unique filename
      const filename = generateScriptFilename(trimmedContent);
      const scriptFilePath = path.join(ASSETS_DIR, filename);
      
      // Calculate relative path from HTML file to assets directory
      const relativeToAssets = path.relative(path.dirname(filePath), ASSETS_DIR).split(path.sep).join('/');
      let relativePath = relativeToAssets ? `${relativeToAssets}/${filename}` : `assets/${filename}`;
      
      // Ensure it's a relative path
      if (!relativePath.startsWith('.')) {
        relativePath = './' + relativePath;
      }

      // Save script content
      fs.writeFileSync(scriptFilePath, trimmedContent, 'utf8');
      scriptCounter++;
      hasChanges = true;

      // Build new script tag
      const attrs = attributes.trim();
      return `<script${attrs ? ' ' + attrs : ''} src="${relativePath}"></script>`;
    });

    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`   Extracted ${scriptCounter} inline script(s) from ${path.relative(DIST_DIR, filePath)}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error extracting scripts from ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Recursively delete a directory
 */
function deleteDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
      return true;
    } catch (error) {
      console.error(`⚠️  Warning: Could not delete ${dirPath}:`, error.message);
      return false;
    }
  }
  return false;
}

/**
 * Main build extension fix function
 */
function buildExtension() {
  console.log('🔧 Fixing Chrome Extension build...\n');

  // Step -1: Clean up old dist directory (out/ will be moved to dist/)
  console.log('🧹 Step -1: Cleaning up old dist/ directory...');
  const deletedDist = deleteDirectory(DIST_DIR);
  
  if (deletedDist) {
    console.log('   ✅ Deleted dist/ directory\n');
  } else {
    console.log('   ℹ️  No old dist/ directory to clean\n');
  }

  // Check if out directory exists (Next.js should have created it)
  if (!fs.existsSync(OUT_DIR)) {
    console.error('❌ Error: out/ directory does not exist. Next.js build may have failed.');
    process.exit(1);
  }

  // Step 0: Move out/ to dist/
  console.log('📦 Step 0: Moving out/ to dist/...');
  try {
    if (fs.existsSync(DIST_DIR)) {
      fs.rmSync(DIST_DIR, { recursive: true, force: true });
    }
    fs.renameSync(OUT_DIR, DIST_DIR);
    console.log('✅ Successfully moved out/ to dist/\n');
  } catch (error) {
    console.error('❌ Error moving out/ to dist/:', error.message);
    process.exit(1);
  }

  // Step 1: Copy manifest.json from public/ to dist/
  console.log('📋 Step 1: Copying manifest.json to output directory...');
  try {
    if (!fs.existsSync(SOURCE_MANIFEST)) {
      console.error(`❌ Error: Source manifest not found at ${SOURCE_MANIFEST}`);
      process.exit(1);
    }
    
    // Read source manifest to verify it contains Caelus Wallet
    const sourceManifestContent = fs.readFileSync(SOURCE_MANIFEST, 'utf8');
    const sourceManifest = JSON.parse(sourceManifestContent);
    
    if (sourceManifest.name !== 'Caelus Wallet') {
      console.error(`❌ Error: Source manifest contains incorrect name: "${sourceManifest.name}". Expected "Caelus Wallet".`);
      process.exit(1);
    }
    
    if (sourceManifest.version !== '1.0.1') {
      console.warn(`⚠️  Warning: Source manifest version is "${sourceManifest.version}", expected "1.0.1".`);
    }
    
    // Copy the manifest file
    fs.copyFileSync(SOURCE_MANIFEST, TARGET_MANIFEST);
    
    // Verify the copy was successful
    const targetManifestContent = fs.readFileSync(TARGET_MANIFEST, 'utf8');
    const targetManifest = JSON.parse(targetManifestContent);
    
    if (targetManifest.name === 'Caelus Wallet' && targetManifest.version === '1.0.1') {
      console.log(`✅ Successfully copied manifest.json (${targetManifest.name} v${targetManifest.version})\n`);
    } else {
      console.error(`❌ Error: Copied manifest verification failed. Name: "${targetManifest.name}", Version: "${targetManifest.version}"`);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error copying manifest.json:', error.message);
    process.exit(1);
  }

  // Step 2: Rename _next to next
  if (fs.existsSync(NEXT_DIR)) {
    console.log('📁 Step 2: Renaming _next/ to next/...');
    try {
      if (fs.existsSync(RENAMED_NEXT_DIR)) {
        fs.rmSync(RENAMED_NEXT_DIR, { recursive: true, force: true });
        console.log('   Removed existing next/ directory');
      }
      fs.renameSync(NEXT_DIR, RENAMED_NEXT_DIR);
      console.log('✅ Successfully renamed _next/ to next/\n');
    } catch (error) {
      console.error('❌ Error renaming _next directory:', error.message);
      process.exit(1);
    }
  } else {
    console.log('📁 Step 2: _next/ directory not found (may have been renamed already).\n');
  }

  // Step 3: Convert absolute paths to relative paths in HTML files
  console.log('📝 Step 3: Converting absolute paths to relative paths in HTML files...');
  const htmlFiles = findHtmlFiles(DIST_DIR);
  let htmlUpdateCount = 0;

  htmlFiles.forEach((filePath) => {
    if (processFile(filePath)) {
      htmlUpdateCount++;
      console.log(`✅ Updated: ${path.relative(DIST_DIR, filePath)}`);
    }
  });

  if (htmlUpdateCount > 0) {
    console.log(`✅ Updated paths in ${htmlUpdateCount} HTML file(s).\n`);
  } else {
    console.log('✅ All HTML paths already updated.\n');
  }

  // Step 4: Convert absolute paths to relative paths in JS files
  console.log('📝 Step 4: Converting absolute paths to relative paths in JS files...');
  const jsFiles = findJsFiles(DIST_DIR);
  let jsUpdateCount = 0;

  jsFiles.forEach((filePath) => {
    if (processFile(filePath)) {
      jsUpdateCount++;
      console.log(`✅ Updated: ${path.relative(DIST_DIR, filePath)}`);
    }
  });

  if (jsUpdateCount > 0) {
    console.log(`✅ Updated paths in ${jsUpdateCount} JS file(s).\n`);
  } else {
    console.log('✅ All JS paths already updated.\n');
  }

  // Step 5: Extract inline scripts to external files (HTML files only)
  console.log('🔐 Step 5: Extracting inline scripts for CSP compliance...');
  let filesWithScripts = 0;

  htmlFiles.forEach((filePath) => {
    if (extractInlineScripts(filePath)) {
      filesWithScripts++;
    }
  });

  if (filesWithScripts > 0) {
    console.log(`✅ Extracted inline scripts from ${filesWithScripts} HTML file(s).\n`);
  } else {
    console.log('✅ No inline scripts found (or already extracted).\n');
  }

  console.log('✨ Chrome Extension build fix complete!');
  console.log('   ✅ Fixed _next folder naming');
  console.log('   ✅ Converted all absolute paths to relative paths');
  console.log('   ✅ Extracted inline scripts for CSP compliance\n');
}

// Run the script
buildExtension();

