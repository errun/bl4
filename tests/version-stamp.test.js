const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const scriptPath = path.join(__dirname, '..', 'scripts', 'update-version-stamp.js');
const tmpPath = path.join(__dirname, 'tmp-version.html');
const initialStamp = '2000-01-01 00:00:00';

const html = [
  '<!doctype html>',
  '<html>',
  '<body>',
  `<p class="media-note version-stamp" data-version="${initialStamp}">Version: ${initialStamp}</p>`,
  '</body>',
  '</html>',
  ''
].join('\n');

fs.writeFileSync(tmpPath, html, 'utf8');

try {
  execFileSync('node', [scriptPath, tmpPath], { stdio: 'pipe' });

  const updated = fs.readFileSync(tmpPath, 'utf8');
  const match = updated.match(/data-version="([^"]+)"/);

  assert(match, 'version stamp data attribute should exist');
  assert.notStrictEqual(match[1], initialStamp, 'version stamp should be updated');
  assert(
    updated.includes(`Version: ${match[1]}`),
    'version stamp text should include updated timestamp'
  );
} finally {
  if (fs.existsSync(tmpPath)) {
    fs.unlinkSync(tmpPath);
  }
}

console.log('version stamp test passed');
