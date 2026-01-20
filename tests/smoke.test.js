const assert = require('assert');
const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const themeColorPattern = /<meta\s+name="theme-color"\s+content="#0b0d0f"\s*\/?>/i;

assert(
  themeColorPattern.test(html),
  'index.html should include theme-color meta tag for the brand palette'
);

console.log('smoke test passed');
