# Extension Icons

This directory contains the icon files for the Caelus Wallet Chrome extension.

## Icon Files Required

- `icon16.png` - 16×16 pixels (toolbar icon)
- `icon48.png` - 48×48 pixels (extension management page)
- `icon128.png` - 128×128 pixels (Chrome Web Store)

## Creating PNG Files from SVG

The `icon.svg` file has been created with the Caelus Wallet logo design. To convert it to PNG files at the required sizes:

### Option 1: Using Online Converter
1. Visit https://convertio.co/svg-png/ or https://cloudconvert.com/svg-to-png
2. Upload `icon.svg`
3. Set the output size to 16×16, 48×48, and 128×128
4. Download and save as `icon16.png`, `icon48.png`, and `icon128.png`

### Option 2: Using ImageMagick (Command Line)
```bash
# Install ImageMagick first, then:
magick convert icon.svg -resize 16x16 icon16.png
magick convert icon.svg -resize 48x48 icon48.png
magick convert icon.svg -resize 128x128 icon128.png
```

### Option 3: Using Inkscape (Free Desktop App)
1. Open `icon.svg` in Inkscape
2. File → Export PNG Image
3. Set width/height to 16, 48, or 128
4. Export and save with appropriate filename

### Option 4: Using Node.js Script
If you have `sharp` installed:
```bash
npm install --save-dev sharp
node scripts/generate-icons.js
```

## Design Description

The icon features:
- **Shield shape** with a glowing teal/blue gradient outline
- **Four-pointed star** in the center with a bright teal glow
- **"CAELUS" text** below the shield in matching teal color
- **Dark background** (deep navy/black) for contrast

The design conveys security, innovation, and a connection to stellar/celestial themes, perfect for a Stellar blockchain wallet.
