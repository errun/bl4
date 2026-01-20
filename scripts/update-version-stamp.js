const fs = require('fs');
const path = require('path');

function formatTimestamp(date) {
  const pad = (value) => String(value).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

const targetPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(__dirname, '..', 'index.html');

const html = fs.readFileSync(targetPath, 'utf8');
const elementPattern = /<p[^>]*class="[^"]*version-stamp[^"]*"[^>]*>[\s\S]*?<\/p>/i;
const elementMatch = html.match(elementPattern);

if (!elementMatch) {
  throw new Error(`Version stamp element not found in ${targetPath}`);
}

const timestamp = formatTimestamp(new Date());
let element = elementMatch[0];

if (/data-version="[^"]*"/i.test(element)) {
  element = element.replace(/data-version="[^"]*"/i, `data-version="${timestamp}"`);
} else {
  element = element.replace(/<p/i, `<p data-version="${timestamp}"`);
}

const timePattern = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/g;
element = element.replace(timePattern, timestamp);

const nextHtml = html.replace(elementPattern, element);

fs.writeFileSync(targetPath, nextHtml, 'utf8');
console.log(`Updated version stamp in ${targetPath} -> ${timestamp}`);
