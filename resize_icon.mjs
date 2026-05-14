import sharp from 'sharp';
import fs from 'fs';

async function generate() {
  const bgSize = 1024;
  const fgSize = Math.floor(1024 * 0.6); // 60% of size for safe area
  
  // Create background: solid dark color #171717
  await sharp({
    create: {
      width: bgSize,
      height: bgSize,
      channels: 4,
      background: { r: 23, g: 23, b: 23, alpha: 1 } // #171717
    }
  })
  .png()
  .toFile('assets/icon-background.png');
  
  // Create foreground: transparent background with scaled down icon in center
  await sharp('assets/icon.png')
    .resize(fgSize, fgSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({
      top: Math.floor((bgSize - fgSize) / 2),
      bottom: Math.ceil((bgSize - fgSize) / 2),
      left: Math.floor((bgSize - fgSize) / 2),
      right: Math.ceil((bgSize - fgSize) / 2),
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toFile('assets/icon-foreground.png');
    
  // Also recreate a new padded icon.png
  await sharp('assets/icon-background.png')
    .composite([{ input: 'assets/icon-foreground.png' }])
    .png()
    .toFile('assets/icon-padded.png');
    
  // Overwrite original icon.png with the padded one
  fs.copyFileSync('assets/icon-padded.png', 'assets/icon.png');
  
  console.log("Assets generated successfully");
}

generate().catch(console.error);
