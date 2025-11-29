const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [16, 48, 128];
const inputSvg = path.join(__dirname, '../public/icons/icon.svg');
const outputDir = path.join(__dirname, '../public/icons');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
  console.log('Generating icon files from SVG...');
  
  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon${size}.png`);
    
    try {
      await sharp(inputSvg)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 10, g: 10, b: 10, alpha: 1 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Created icon${size}.png (${size}×${size})`);
    } catch (error) {
      console.error(`❌ Failed to create icon${size}.png:`, error.message);
    }
  }
  
  console.log('\n✨ Icon generation complete!');
  console.log('Icons are ready in public/icons/');
}

generateIcons().catch(console.error);

