# Chrome Extension Build Fix - `_next` Folder Issue

## Problem

Chrome Extensions block filenames and directories starting with `_` (underscore). Next.js by default creates a `_next` folder for static assets, which causes the extension to fail loading.

## Solution

A post-build script automatically:
1. ✅ Renames `out/_next/` → `out/next/`
2. ✅ Updates all HTML files to replace `/_next/` with `/next/`

## Configuration

### ✅ Next.js Config (`next.config.mjs`)

Already correctly configured:
- `output: 'export'` - Static HTML generation
- `images: { unoptimized: true }` - Extension-compatible images

### ✅ Package.json Build Script

The build script now automatically runs the fix:
```json
"build": "next build && node scripts/build-extension.js"
```

## How It Works

1. **Build Phase**: Next.js builds the static site to `out/` directory
2. **Fix Phase**: The `scripts/build-extension.js` script:
   - Renames `out/_next/` to `out/next/`
   - Recursively finds all `.html` files in `out/`
   - Replaces all occurrences of `/_next/` with `/next/` in HTML files

## Usage

Simply run:
```bash
npm run build
```

The script will automatically:
- ✅ Build your Next.js app
- ✅ Rename `_next/` to `next/`
- ✅ Update all HTML file references

## Output Example

```
🔧 Fixing Chrome Extension build...

📁 Step 1: Renaming _next/ to next/...
✅ Successfully renamed _next/ to next/

📝 Step 2: Updating HTML files to use /next/ instead of /_next/...
✅ Updated: index.html
✅ Updated: dashboard/index.html
✅ Updated: login/index.html
... (all HTML files)

✨ Done! Updated 9 HTML file(s).
✅ Chrome Extension build fix complete!
```

## Manual Execution

If you need to run the fix script separately:
```bash
node scripts/build-extension.js
```

## Verification

After building, verify:
1. ✅ `out/next/` exists (not `out/_next/`)
2. ✅ All HTML files reference `/next/` (not `/_next/`)
3. ✅ Extension loads in Chrome without errors

## Troubleshooting

### Script fails with "out/ directory does not exist"
- Run `npm run build` first (the script runs automatically after build)

### Some HTML files still reference `/_next/`
- The script uses regex to catch most patterns
- If you find edge cases, check the `replaceNextPathInFile` function in `scripts/build-extension.js`

### Extension still shows errors
- Clear Chrome extension cache
- Remove and reload the extension
- Verify `out/next/` directory exists and contains files

## Files Modified

- ✅ `package.json` - Updated build script
- ✅ `scripts/build-extension.js` - New post-build fix script

## Compatibility

- ✅ Windows (tested)
- ✅ macOS
- ✅ Linux
- ✅ Node.js 14+ (uses standard `fs` module)

