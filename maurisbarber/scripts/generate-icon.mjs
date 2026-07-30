// One-off script that generated public/icons/*.png. Not part of the app's
// runtime dependencies — run `npm install --no-save sharp` before invoking
// this again to regenerate the icons.
import sharp from "sharp";
import { mkdirSync } from "fs";
import path from "path";

const svg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="112" fill="#111111"/>
  <text x="256" y="336" font-family="Georgia, 'Times New Roman', serif" font-size="280"
        font-weight="700" fill="#ffffff" text-anchor="middle">M</text>
  <circle cx="380" cy="150" r="26" fill="#16a34a"/>
</svg>
`;

const outDir = path.join(process.cwd(), "public", "icons");
mkdirSync(outDir, { recursive: true });

const sizes = [192, 512];
for (const size of sizes) {
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(path.join(outDir, `icon-${size}.png`));
}

await sharp(Buffer.from(svg)).resize(180, 180).png().toFile(path.join(outDir, "apple-touch-icon.png"));

console.log("Icons generated in public/icons/");
