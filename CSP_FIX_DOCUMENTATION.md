# Content Security Policy (CSP) Fix for Chrome Extension

## Problem

Chrome Extension Manifest V3 enforces strict Content Security Policy (CSP) that **forbids inline scripts**. Next.js static export generates HTML files with inline `<script>` tags for webpack runtime and router initialization, causing CSP violations.

### Error Message
```
Refused to execute inline script because it violates the following Content Security Policy directive: "script-src 'self'"
```

## Solution

The `scripts/build-extension.js` script now automatically:

1. ✅ **Finds all inline scripts** in HTML files (scripts without `src` attribute)
2. ✅ **Extracts script content** to external `.js` files
3. ✅ **Generates unique filenames** using SHA-256 hash (first 8 characters)
4. ✅ **Replaces inline scripts** with `<script src="/assets/inline-xxxxx.js"></script>`
5. ✅ **Preserves script attributes** (async, defer, etc.)

## How It Works

### Step 1: Detect Inline Scripts
The script uses regex to find `<script>` tags without `src` attributes:
```javascript
/<script(?![^>]*\ssrc=)([^>]*)>([\s\S]*?)<\/script>/gi
```

### Step 2: Extract and Save
- Script content is extracted
- SHA-256 hash is computed for uniqueness
- Saved to `out/assets/inline-{hash}.js`

### Step 3: Replace in HTML
- Inline `<script>content</script>` is replaced with `<script src="/assets/inline-{hash}.js"></script>`
- Original attributes (async, defer, etc.) are preserved

## Usage

The script runs automatically after build:
```bash
npm run build
```

Or run manually:
```bash
node scripts/build-extension.js
```

## Output Example

```
🔧 Fixing Chrome Extension build...

📁 Step 1: _next/ directory not found (may have been renamed already).

📝 Step 2: Updating HTML files to use /next/ instead of /_next/...
✅ All paths already updated.

🔐 Step 3: Extracting inline scripts for CSP compliance...
   Extracted 5 inline script(s) from index.html
   Extracted 5 inline script(s) from dashboard/index.html
   ...
✅ Extracted inline scripts from 9 HTML file(s).
   Scripts saved to: assets/

✨ Chrome Extension build fix complete!
   ✅ Fixed _next folder naming
   ✅ Extracted inline scripts for CSP compliance
```

## File Structure

After running the script:
```
out/
├── index.html              ✅ No inline scripts
├── assets/                 ✅ Extracted scripts
│   ├── inline-0113525b.js
│   ├── inline-055dfbb1.js
│   └── ...
├── dashboard/
│   └── index.html          ✅ No inline scripts
└── ...
```

## Verification

### Check HTML Files
All HTML files should now reference external scripts:
```html
<!-- Before (CSP violation) -->
<script>(self.__next_f=self.__next_f||[]).push([0]);</script>

<!-- After (CSP compliant) -->
<script src="/assets/inline-0113525b.js"></script>
```

### Check Assets Directory
```bash
# Verify scripts were created
ls out/assets/

# Should see files like:
# inline-0113525b.js
# inline-055dfbb1.js
# ...
```

## Benefits

1. ✅ **CSP Compliant** - No inline scripts, passes Chrome Extension validation
2. ✅ **Unique Filenames** - SHA-256 hash prevents collisions
3. ✅ **Preserves Functionality** - All script attributes maintained
4. ✅ **Automatic** - Runs as part of build process
5. ✅ **Cross-Platform** - Works on Windows, macOS, Linux

## Technical Details

### Hash Generation
```javascript
function generateScriptFilename(content) {
  const hash = crypto.createHash('sha256').update(content).digest('hex');
  return `inline-${hash.substring(0, 8)}.js`;
}
```

### Script Detection
- Matches `<script>` tags without `src` attribute
- Skips empty scripts (whitespace only)
- Preserves all script attributes

### File Naming
- Format: `inline-{8-char-hash}.js`
- Hash ensures uniqueness even for identical content
- Short hash keeps filenames readable

## Troubleshooting

### Scripts Not Extracted
- Check that HTML files contain inline `<script>` tags
- Verify `out/` directory exists
- Check console for error messages

### CSP Errors Still Occur
1. Clear Chrome extension cache
2. Remove and reload extension
3. Check browser console for specific CSP violations
4. Verify `manifest.json` has correct CSP settings

### Duplicate Script Files
- Same content = same hash = same filename (intentional)
- Scripts are reused across HTML files when content is identical

## Manifest CSP Configuration

Your `manifest.json` should have:
```json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

This allows scripts from `'self'` (extension files) but blocks inline scripts.

## Related Fixes

This script also handles:
- ✅ Renaming `_next/` → `next/` (Chrome blocks `_` prefix)
- ✅ Updating all HTML references to use `/next/` paths

All fixes run automatically in a single build step!

