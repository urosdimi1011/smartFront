const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputImage = path.resolve('public/logo.png');
const outputDir = path.resolve(__dirname, '../public/img/icons');

const sizes = [
  48,
  72,
  96,
  128,
  144,
  152,
  192,
  384,
  512
];

// napravi folder ako ne postoji
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

(async () => {
  try {
    for (const size of sizes) {
      const outputFile = path.join(outputDir, `icon-${size}x${size}.png`);

      await sharp(inputImage)
        .resize(size, size)
        .png({ quality: 100 })
        .toFile(outputFile);

      console.log(`✔ Generated ${outputFile}`);
    }

    console.log('\n🎉 PWA icons generated successfully!');
  } catch (err) {
    console.error('❌ Error generating icons:', err);
  }
})();
