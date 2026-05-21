import sharp from 'sharp';
import fs from 'fs';

async function processIcon() {
  try {
    const size = 1800; // The actual logo size without borders might be smaller. We'll crop a circle of size 1600 from the center of the 2048x2048 image.
    const cropSize = 1650;

    // Create a circular SVG mask
    const circleSvg = `
      <svg width="${cropSize}" height="${cropSize}">
        <circle cx="${cropSize / 2}" cy="${cropSize / 2}" r="${cropSize / 2}" fill="white"/>
      </svg>
    `;

    // Extract the center of the image and mask it with a circle
    await sharp('icon.png')
      .extract({
        left: Math.floor((2048 - cropSize) / 2),
        top: Math.floor((2048 - cropSize) / 2),
        width: cropSize,
        height: cropSize
      })
      .composite([{
        input: Buffer.from(circleSvg),
        blend: 'dest-in'
      }])
      .png()
      .toFile('icon-rounded.png');

    console.log("Created icon-rounded.png");

    // Now we update the resize_icon.mjs logic to use our clean icon!
    // But since the user wants it to look nice in Android, we should generate the android icons with capacitor-assets.
    // Wait, the project doesn't have @capacitor/assets in package.json? Let's check package.json.
  } catch (e) {
    console.error(e);
  }
}
processIcon();
