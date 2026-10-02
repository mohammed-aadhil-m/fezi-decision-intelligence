import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function processLogo() {
  const inputPath = path.resolve('public/fezi-logo.png');
  const image = sharp(inputPath);
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  console.log(`Processing image: ${width}x${height}, channels: ${channels}`);

  // Create transparent buffer for dark background
  const transparentBuffer = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const outIdx = (y * width + x) * 4;

      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Detect background: near-white / light vignette
      // Distance from white (255, 255, 255)
      const diffFromWhite = (255 - r) * 0.3 + (255 - g) * 0.59 + (255 - b) * 0.11;

      // Check if it's the blue ribbon or dark shadow or lettermark
      const isBlue = (b > r + 15 || b > g + 10) && (r < 235 || g < 240);
      const isDarkShadow = (r < 180 && g < 180 && b < 180);
      const isLettermark = y > 280 && diffFromWhite > 12;

      if (isBlue || isDarkShadow || isLettermark) {
        // Keep foreground pixel
        transparentBuffer[outIdx] = r;
        transparentBuffer[outIdx + 1] = g;
        transparentBuffer[outIdx + 2] = b;
        
        // Alpha calculation based on contrast
        let alpha = 255;
        if (diffFromWhite < 45 && !isBlue) {
          alpha = Math.min(255, Math.max(0, Math.round((diffFromWhite / 45) * 255)));
        }
        transparentBuffer[outIdx + 3] = alpha;
      } else if (diffFromWhite > 20) {
        // Soft edge anti-aliasing
        const alpha = Math.min(255, Math.round(((diffFromWhite - 20) / 60) * 220));
        transparentBuffer[outIdx] = r;
        transparentBuffer[outIdx + 1] = g;
        transparentBuffer[outIdx + 2] = b;
        transparentBuffer[outIdx + 3] = alpha;
      } else {
        // Pure background -> completely transparent
        transparentBuffer[outIdx] = 0;
        transparentBuffer[outIdx + 1] = 0;
        transparentBuffer[outIdx + 2] = 0;
        transparentBuffer[outIdx + 3] = 0;
      }
    }
  }

  // Save full transparent logo
  await sharp(transparentBuffer, { raw: { width, height, channels: 4 } })
    .png()
    .toFile(path.resolve('public/fezi-logo-dark.png'));
  console.log('Saved public/fezi-logo-dark.png');

  // Crop the "F" ribbon icon (center region)
  // X: 360 to 660, Y: 40 to 320
  const iconCrop = await sharp(transparentBuffer, { raw: { width, height, channels: 4 } })
    .extract({ left: 390, top: 50, width: 280, height: 260 })
    .trim()
    .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.resolve('public/fezi-icon.png'));
  console.log('Saved public/fezi-icon.png');

  // Favicon (64x64)
  await sharp(path.resolve('public/fezi-icon.png'))
    .resize(64, 64)
    .png()
    .toFile(path.resolve('public/favicon.png'));
  console.log('Saved public/favicon.png');

  // Copy to src/assets as well
  fs.copyFileSync(path.resolve('public/fezi-icon.png'), path.resolve('src/assets/fezi-icon.png'));
  fs.copyFileSync(path.resolve('public/fezi-logo-dark.png'), path.resolve('src/assets/fezi-logo-dark.png'));
}

processLogo().catch(console.error);
