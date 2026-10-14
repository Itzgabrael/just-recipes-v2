const sharp = require("sharp");
const path = require("node:path");

const publicDirectory = path.join(__dirname, "..", "public");

const inputImage = path.join(publicDirectory, "pwa-512x512.png");

async function generateIcons() {
  try {
    await sharp(inputImage)
      .resize(192, 192)
      .png()
      .toFile(path.join(publicDirectory, "pwa-192x192.png"));

    await sharp(inputImage)
      .resize(512, 512)
      .png()
      .toFile(path.join(publicDirectory, "pwa-512x512-new.png"));

    console.log("PWA icons generated successfully.");
    console.log("192 × 192: public/pwa-192x192.png");
    console.log("512 × 512: public/pwa-512x512-new.png");
  } catch (error) {
    console.error("Failed to generate PWA icons:", error.message);
    process.exitCode = 1;
  }
}

void generateIcons();