const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const OUT_DIR = path.join(__dirname, '..', 'out');
const NEXT_DIR = path.join(OUT_DIR, '_next');
const RENAMED_NEXT_DIR = path.join(OUT_DIR, 'next');
const ASSETS_DIR = path.join(OUT_DIR, 'assets');

/**
 * Recursively find all HTML files in a directory
 */
function findHtmlFiles(dir, fileList = []) {
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
 * Replace all occurrences of /_next/ with /next/ in a file
 */
function replaceNextPathInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Replace all occurrences of /_next/ with /next/
    content = content.replace(/_next\//g, 'next/');
    // Also handle cases where it might be at the start or with different separators
    content = content.replace(/"_next\//g, '"next/');
    content = content.replace(/'_next\//g, "'next/");
    content = content.replace(/\(_next\//g, '(next/');
    content = content.replace(/\/_next"/g, '/next"');
    content = content.replace(/\/_next'/g, "/next'");
    content = content.replace(/\/_next\)/g, '/next)');

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated paths: ${path.relative(OUT_DIR, filePath)}`);
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
    // Matches: <script>...</script> or <script ...>...</script> (without src="...")
    const inlineScriptRegex = /<script(?![^>]*\ssrc=)([^>]*)>([\s\S]*?)<\/script>/gi;
    
    content = content.replace(inlineScriptRegex, (match, attributes, scriptContent) => {
      // Skip empty scripts or scripts with only whitespace
      const trimmedContent = scriptContent.trim();
      if (!trimmedContent) {
        return match; // Keep original if empty
      }

      // Generate unique filename based on content hash
      const filename = generateScriptFilename(trimmedContent);
      const scriptFilePath = path.join(ASSETS_DIR, filename);
      const relativePath = `/assets/${filename}`;

      // Save script content to external file
      fs.writeFileSync(scriptFilePath, trimmedContent, 'utf8');
      scriptCounter++;
      hasChanges = true;

      // Build new script tag with src attribute
      // Preserve original attributes (like async, defer, etc.) but remove any existing content
      const attrs = attributes.trim();
      const newScriptTag = `<script${attrs ? ' ' + attrs : ''} src="${relativePath}"></script>`;
      
      return newScriptTag;
    });

    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`   Extracted ${scriptCounter} inline script(s) from ${path.relative(OUT_DIR, filePath)}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error extracting scripts from ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Main build extension fix function
 */
function buildExtension() {
  console.log('🔧 Fixing Chrome Extension build...\n');

  // Check if out directory exists
  if (!fs.existsSync(OUT_DIR)) {
    console.error('❌ Error: out/ directory does not exist. Run "npm run build" first.');
    process.exit(1);
  }

  // Step 1: Rename _next to next (if it exists)
  if (fs.existsSync(NEXT_DIR)) {
    console.log('📁 Step 1: Renaming _next/ to next/...');
    try {
      if (fs.existsSync(RENAMED_NEXT_DIR)) {
        // Remove existing next directory if it exists
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
    console.log('📁 Step 1: _next/ directory not found (may have been renamed already).\n');
  }

  // Step 2: Update HTML files to use /next/ instead of /_next/
  console.log('📝 Step 2: Updating HTML files to use /next/ instead of /_next/...');
  const htmlFiles = findHtmlFiles(OUT_DIR);
  let pathUpdateCount = 0;

  htmlFiles.forEach((filePath) => {
    if (replaceNextPathInFile(filePath)) {
      pathUpdateCount++;
    }
  });

  if (pathUpdateCount > 0) {
    console.log(`✅ Updated paths in ${pathUpdateCount} HTML file(s).\n`);
  } else {
    console.log('✅ All paths already updated.\n');
  }

  // Step 3: Extract inline scripts to external files
  console.log('🔐 Step 3: Extracting inline scripts for CSP compliance...');
  let scriptExtractCount = 0;
  let filesWithScripts = 0;

  htmlFiles.forEach((filePath) => {
    if (extractInlineScripts(filePath)) {
      filesWithScripts++;
      scriptExtractCount++;
    }
  });

  if (filesWithScripts > 0) {
    console.log(`✅ Extracted inline scripts from ${filesWithScripts} HTML file(s).`);
    console.log(`   Scripts saved to: ${path.relative(OUT_DIR, ASSETS_DIR)}/\n`);
  } else {
    console.log('✅ No inline scripts found (or already extracted).\n');
  }

  console.log('✨ Chrome Extension build fix complete!');
  console.log('   ✅ Fixed _next folder naming');
  console.log('   ✅ Extracted inline scripts for CSP compliance\n');
}

// Run the script
buildExtension();
