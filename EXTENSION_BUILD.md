# Building Caelus Wallet as a Chrome Extension

This guide explains how to build and install Caelus Wallet as a Chrome browser extension.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Chrome browser

## Build Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Extension

```bash
npm run build
```

This will generate a static export in the `out/` directory, which contains all the files needed for the Chrome extension.

### 3. Create Extension Icons

Before loading the extension, you need to create icon files:

1. Navigate to `public/icons/`
2. Create three PNG files:
   - `icon16.png` (16x16 pixels)
   - `icon48.png` (48x48 pixels)
   - `icon128.png` (128x128 pixels)

You can use any image editor or online icon generator. For testing, you can create simple colored squares as placeholders.

### 4. Load the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in the top-right corner)
3. Click **Load unpacked**
4. Select the `out/` directory from your project
5. The extension should now appear in your extensions list

### 5. Test the Extension

1. Click the extension icon in Chrome's toolbar
2. The Caelus Wallet popup should open (360x600px)
3. You should see the onboarding screen

## Project Structure

```
Stellar/
├── out/                    # Generated static files (after build)
│   ├── index.html         # Entry point
│   ├── _next/             # Next.js assets
│   └── icons/             # Extension icons
├── public/
│   ├── manifest.json       # Extension manifest
│   └── icons/             # Icon source files
├── app/                    # Next.js app directory
├── components/             # React components
└── next.config.mjs        # Next.js config (static export)
```

## Configuration Details

### next.config.mjs

- `output: 'export'` - Generates static HTML files
- `images: { unoptimized: true }` - Required for extension compatibility
- `trailingSlash: true` - Ensures proper routing in static export

### manifest.json

- **manifest_version**: 3 (latest Chrome extension format)
- **action.default_popup**: Points to `index.html`
- **permissions**: `storage` (for wallet data), `activeTab` (for web interactions)
- **host_permissions**: Stellar Horizon APIs and CoinGecko API

## Troubleshooting

### Extension won't load

- Ensure all icon files exist in `out/icons/`
- Check that `manifest.json` is valid JSON
- Verify the build completed successfully

### Navigation not working

- Static export uses client-side routing, which should work automatically
- If issues occur, check browser console for errors

### Popup size issues

- The extension is configured for 360x600px popup
- Check `app/layout.tsx` and `app/globals.css` for size constraints

## Development

For development, you can still use:

```bash
npm run dev
```

However, to test the extension, you must:
1. Build the static export (`npm run build`)
2. Load the `out/` directory in Chrome
3. Reload the extension after making changes

## Production Build

For production:
1. Create proper icon assets
2. Update version in `manifest.json` and `package.json`
3. Build: `npm run build`
4. Test thoroughly in Chrome
5. Package the `out/` directory for distribution

