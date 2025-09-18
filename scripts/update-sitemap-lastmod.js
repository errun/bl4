#!/usr/bin/env node
/*
  Update <lastmod> in sitemap.xml based on file modification times.
  Mapping rule:
    /           -> index.html
    /en/        -> en/index.html
    /builds/    -> builds/index.html
    /en/builds/ -> en/builds/index.html
    /*.html     -> remove leading slash and use as relative path
*/
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const ROOT = process.cwd();
const SITEMAP_PATH = path.join(ROOT, 'sitemap.xml');

function urlToRelPath(u) {
  try {
    const { pathname, host, protocol } = new URL(u);
    // Guard: only operate for our domain
    if (!(host === 'bl4builds.net' && (protocol === 'https:' || protocol === 'http:'))) return null;
    if (pathname === '/' || pathname === '/index.html') return 'index.html';
    if (pathname.endsWith('/')) return pathname.slice(1) + 'index.html';
    return pathname.slice(1);
  } catch (e) {
    return null;
  }
}

function fmtDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}


function getGitDate(relPath) {
  try {
    const p = relPath.replace(/\\/g, '/');
    const out = cp.execSync(`git log -1 --format=%cs -- "${p}"`, { cwd: ROOT, stdio: ['ignore','pipe','ignore'] })
      .toString()
      .trim();
    return out || null; // yyyy-mm-dd
  } catch (e) {
    return null;
  }
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function updateSitemap() {
  if (!fs.existsSync(SITEMAP_PATH)) {
    console.error('sitemap.xml not found at project root');
    process.exit(1);
  }
  let xml = fs.readFileSync(SITEMAP_PATH, 'utf8');

  // Collect all <loc> entries
  const locRegex = /<loc>([^<]+)<\/loc>/g;
  let match;
  let updates = 0;
  while ((match = locRegex.exec(xml)) !== null) {
    const url = match[1].trim();
    const rel = urlToRelPath(url);
    if (!rel) continue;
    const filePath = path.join(ROOT, rel);
    if (!fs.existsSync(filePath)) {
      // Skip if file not present (could be external)
      continue;
    }
    const gitDate = getGitDate(rel);
    const date = gitDate || fmtDate(fs.statSync(filePath).mtime);

    const blockRegex = new RegExp(
      `(<loc>${escapeRegExp(url)}<\/loc>[\\s\\S]*?<lastmod>)([^<]+)(<\/lastmod>)`
    );
    if (blockRegex.test(xml)) {
      xml = xml.replace(blockRegex, `$1${date}$3`);
      updates++;
    }
  }

  fs.writeFileSync(SITEMAP_PATH, xml);
  console.log(`Updated <lastmod> for ${updates} URL(s).`);
}

updateSitemap();

