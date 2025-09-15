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

  console.log('Converting to WebP (quality 80) + responsive sizes:');
  const sizeMap = {
    // hero gets larger breakpoints
    'hero': [768, 1280, 1920],
    // visuals default
    '*': [480, 768, 1200]
  };

  for (const name of targets) {
    const src = path.join(SRC_DIR, name);
    const base = name.replace(/\.(jpe?g|png)$/i, '');

    // 1) baseline full-size .webp
    const fullOut = path.join(SRC_DIR, base + '.webp');
    if (!fs.existsSync(fullOut)) {
      try {
        const img = sharp(src);
        const metadata = await img.metadata();
        await img.webp({ quality: 80 }).toFile(fullOut);
        const outStat = fs.statSync(fullOut);
        const inStat = fs.statSync(src);
        console.log(`  ok: ${path.basename(src)} -> ${path.basename(fullOut)}  (${Math.round(outStat.size/1024)}KB from ${Math.round(inStat.size/1024)}KB)`);
      } catch (err) {
        console.error('  fail full:', name, err.message);
      }
    } else {
      console.log('  skip full (exists):', path.basename(fullOut));
    }

    // 2) responsive sized variants
    const key = base.startsWith('hero') ? 'hero' : '*';
    const sizes = sizeMap[key];
    for (const w of sizes) {
      const out = path.join(SRC_DIR, `${base}-${w}w.webp`);
      if (fs.existsSync(out)) {
        console.log('  skip size (exists):', path.basename(out));
        continue;
      }
      try {
        await sharp(src).resize({ width: w }).webp({ quality: 80 }).toFile(out);
        const outStat = fs.statSync(out);
        console.log(`  ok size: ${base}-${w}w.webp (${Math.round(outStat.size/1024)}KB)`);
      } catch (err) {
        console.error('  fail size:', name, w, err.message);
      }
    }
  }
  console.log('Done.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

