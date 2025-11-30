# Chrome Extension Final Configuration

## ✅ Configuration Status

### 1. Routing (Next.js File-Based Routing)
- ✅ **No BrowserRouter needed** - Next.js uses file-based routing which works perfectly with static export
- ✅ All routes use `router.push()` from `next/navigation` which is compatible with static export
- ✅ Static export generates HTML files for each route (e.g., `index.html`, `dashboard/index.html`)
- ✅ Client-side navigation works automatically in Chrome extensions

### 2. Manifest Configuration
- ✅ **Manifest V3** - Latest Chrome extension format
- ✅ `default_popup: "index.html"` - Correct entry point
- ✅ `permissions: ["storage"]` - For wallet data persistence
- ✅ `host_permissions` - For Stellar Horizon and CoinGecko APIs
- ✅ `content_security_policy` - Properly configured for extension pages

### 3. Style Constraints
- ✅ **Popup Dimensions**: `360px × 600px` (set in both `app/layout.tsx` and `app/globals.css`)
- ✅ Overflow handling for scrollable content
- ✅ Fixed dimensions prevent layout issues

### 4. Build Configuration
- ✅ **Output Directory**: `out/` (Next.js default for static export)
- ✅ **Asset Paths**: Relative paths (handled automatically by Next.js static export)
- ✅ **Images**: Unoptimized (required for extension compatibility)
- ✅ **Trailing Slash**: Enabled for proper routing

## Build Instructions

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Create Extension Icons
Create the following icon files in `public/icons/`:
- `icon16.png` (16×16 pixels)
- `icon48.png` (48×48 pixels)
- `icon128.png` (128×128 pixels)

### Step 3: Build the Extension
```bash
npm run build
```

This will generate the `out/` directory with all static files.

### Step 4: Load in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the `out/` directory
5. The extension will appear in your extensions list

### Step 5: Test
1. Click the Caelus Wallet icon in Chrome toolbar
2. The popup should open at 360×600px
3. Test all navigation flows:
   - Landing page → Create/Import
   - Login flow
   - Dashboard functionality

## File Structure After Build

```
out/
├── index.html              # Landing page
├── dashboard/
│   └── index.html          # Dashboard page
├── login/
│   └── index.html          # Login page
├── create/
│   └── index.html          # Create wallet page
├── import/
│   └── index.html          # Import wallet page
├── create-password/
│   └── index.html          # Create password page
├── _next/
│   ├── static/             # Static assets (JS, CSS)
│   └── ...
├── manifest.json            # Extension manifest (copied from public/)
└── icons/                   # Extension icons (copied from public/icons/)
```

## Important Notes

### Routing in Extensions
- Next.js static export generates separate HTML files for each route
- Client-side navigation uses JavaScript to update the URL without page reloads
- All routes work correctly in the `chrome-extension://` protocol context

### Storage
- Uses `localStorage` for wallet data (works in extension context)
- Encrypted vault is stored in `localStorage` as `caelus_encrypted_vault`
- Read-only wallets are stored with `stellar_isReadOnly` flag

### API Calls
- All API calls use absolute URLs (Horizon, CoinGecko)
- `host_permissions` in manifest allow these external requests
- CORS is handled by the extension's permissions

### Development vs Production
- **Development**: Use `npm run dev` for local testing
- **Production**: Use `npm run build` to generate extension files
- Always test the built extension in Chrome after making changes

## Troubleshooting

### Extension won't load
- Check browser console for errors
- Verify `manifest.json` is valid JSON
- Ensure all icon files exist in `out/icons/`

### Navigation not working
- Check browser console for JavaScript errors
- Verify all route files were generated in `out/` directory
- Ensure `trailingSlash: true` in `next.config.mjs`

### Styling issues
- Verify popup dimensions are set correctly
- Check that Tailwind CSS is compiled correctly
- Ensure `app/globals.css` is loaded

### API calls failing
- Verify `host_permissions` in manifest
- Check browser console for CORS errors
- Ensure network requests are allowed

## Production Checklist

Before distributing:
- [ ] Create proper icon assets (16, 48, 128px)
- [ ] Update version in `manifest.json` and `package.json`
- [ ] Test all user flows (create, import, login, send, receive)
- [ ] Test read-only mode
- [ ] Verify encryption/decryption works
- [ ] Test on clean Chrome profile
- [ ] Build and test the extension
- [ ] Package `out/` directory for distribution

