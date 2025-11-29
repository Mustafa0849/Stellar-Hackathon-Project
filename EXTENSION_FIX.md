# Chrome Extension - Manifest Popup Fix

## ✅ Current Status

**Good News:** The build is working correctly! Both `index.html` and `manifest.json` exist in the `out/` directory.

## Important Clarification

### This is a Next.js Project (NOT Vite)
- **Build Tool**: Next.js 14 (not Vite)
- **Output Directory**: `out/` (NOT `dist/`)
- **Build Command**: `npm run build`

### Verified Files (After Build)

```
out/
├── index.html          ✅ EXISTS - This is your default_popup
├── manifest.json       ✅ EXISTS - Extension manifest
└── icons/              ✅ EXISTS - All icon files
```

## Solution: Load the Correct Directory

The error "default_popup file doesn't exist" usually means you're loading the wrong directory.

### Correct Steps:

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Verify files exist:**
   ```bash
   # Windows PowerShell
   Test-Path out\index.html
   Test-Path out\manifest.json
   
   # Should return: True
   ```

3. **Load in Chrome:**
   - Open `chrome://extensions/`
   - Enable **Developer mode**
   - Click **Load unpacked**
   - **IMPORTANT**: Select the `out/` directory (NOT `dist/`, NOT `public/`, NOT root folder)
   - The path should be: `C:\Users\net\OneDrive\Masaüstü\Stellar\out`

## If You Still Get the Error

### Check 1: Verify File Locations
```bash
# In PowerShell, from project root:
Get-ChildItem out\index.html
Get-ChildItem out\manifest.json
Get-ChildItem out\icons\*.png
```

All should exist.

### Check 2: Manifest Path
Open `out/manifest.json` and verify:
```json
{
  "action": {
    "default_popup": "index.html"  // ✅ Should be exactly this
  }
}
```

### Check 3: Clear Chrome Extension Cache
1. Remove the extension from Chrome
2. Close Chrome completely
3. Reopen Chrome
4. Load the extension again from `out/` directory

### Check 4: File Permissions
Ensure files are not read-only:
```powershell
Get-Item out\index.html | Select-Object IsReadOnly
# Should be: False
```

## Build Configuration

The `next.config.mjs` is correctly configured:
- ✅ `output: 'export'` - Static export mode
- ✅ `images: { unoptimized: true }` - Extension compatible
- ✅ `trailingSlash: true` - Proper routing
- ✅ `assetPrefix: ''` - Relative paths

## Next.js Static Export Behavior

Next.js automatically:
- ✅ Generates `index.html` at root of `out/`
- ✅ Copies `public/manifest.json` to `out/manifest.json`
- ✅ Copies `public/icons/` to `out/icons/`
- ✅ Generates all route pages as `route/index.html`

## Still Having Issues?

If the error persists after verifying the above:

1. **Check browser console** (F12) for specific error messages
2. **Verify the exact path** you're loading in Chrome
3. **Try a fresh build:**
   ```bash
   # Delete old build
   Remove-Item -Recurse -Force out
   
   # Rebuild
   npm run build
   
   # Verify
   Test-Path out\index.html
   ```

The configuration is correct - the issue is likely loading the wrong directory or a Chrome cache problem.

