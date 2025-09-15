/*
  Generate WebP versions for images in assets/img/bl4
  - Converts .jpg and .png to .webp with quality 80
  - Skips files that already have a corresponding .webp
*/
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SRC_DIR = path.resolve(__dirname, '..', 'assets', 'img', 'bl4');

async function main() {
  if (!fs.existsSync(SRC_DIR)) {
    console.error('Directory not found:', SRC_DIR);
    process.exit(1);
  }
  const entries = fs.readdirSync(SRC_DIR, { withFileTypes: true });
  const targets = entries
    .filter(e => e.isFile())
    .map(e => e.name)
    .filter(name => /\.(jpe?g|png)$/i.test(name));

  if (!targets.length) {
    console.log('No JPG/PNG files found in', SRC_DIR);
    return;
  }

  console.log('Converting to WebP (quality 80):');
  for (const name of targets) {
    const src = path.join(SRC_DIR, name);
    const base = name.replace(/\.(jpe?g|png)$/i, '');
    const out = path.join(SRC_DIR, base + '.webp');
    if (fs.existsSync(out)) {
      console.log('  skip (exists):', path.basename(out));
      continue;
    }
    try {
      const img = sharp(src);
      const metadata = await img.metadata();
      await img.webp({ quality: 80 }).toFile(out);
      const outStat = fs.statSync(out);
      const inStat = fs.statSync(src);
      console.log(
        `  ok: ${path.basename(src)} -> ${path.basename(out)}  (${Math.round(outStat.size/1024)}KB from ${Math.round(inStat.size/1024)}KB, ${metadata.width}x${metadata.height})`
      );
    } catch (err) {
      console.error('  fail:', name, err.message);
    }
  }
  console.log('Done.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

