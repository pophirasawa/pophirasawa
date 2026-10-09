'use strict';

const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../public');

function check() {
  const failures = [];
  const wikiPages = [];
  let pages = 0;
  function visit(folder) {
    for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
      const file = path.join(folder, entry.name);
      if (entry.isDirectory()) { visit(file); continue; }
      if (!file.endsWith('.html') && !file.endsWith('.css')) continue;
      const text = fs.readFileSync(file, 'utf8');
      const label = path.relative(root, file);
      if (file.endsWith('.html')) {
        pages++;
        if (label.startsWith('wiki/')) wikiPages.push({ label, text });
        // Ordinary outbound article/friend links are intentionally allowed.
        for (const match of text.matchAll(/<(script|link)\b[^>]*>/gi)) {
          const tag = match[0];
          const loaded = match[1].toLowerCase() === 'script' || /\brel=["'](?:stylesheet|preload|modulepreload|dns-prefetch)["']/i.test(tag);
          if (loaded && /\b(?:src|href)=["'](?:https?:)?\/\//i.test(tag)) failures.push(`${label}: external runtime resource ${tag}`);
          const local = tag.match(/\b(?:src|href)=["'](\/[^/][^"']*)["']/i)?.[1];
          if (loaded && local && !fs.existsSync(path.join(root, decodeURIComponent(local.split(/[?#]/)[0])))) failures.push(`${label}: missing runtime resource ${local}`);
        }
        for (const match of text.matchAll(/\b(?:src|href)=["'](\/[^"']*)["']/g)) {
          const url = match[1].split(/[?#]/)[0];
          if (!url.startsWith('/vendor/')) continue;
          if (!fs.existsSync(path.join(root, decodeURIComponent(url)))) failures.push(`${label}: missing ${url}`);
        }
        for (const match of text.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["']/gi)) {
          const src = match[1];
          if (/^(?:https?:|data:|\/\/)/i.test(src)) continue;
          const local = decodeURIComponent(new URL(src, 'https://local.invalid/' + label.replaceAll(path.sep, '/')).pathname);
          if (!fs.existsSync(path.join(root, local))) failures.push(`${label}: missing image ${src}`);
        }
        if (!label.startsWith('wiki/wiki/') && /(?:href|src)=["']\/wiki\/wiki\//i.test(text)) failures.push(`${label}: doubled Wiki prefix`);
      } else if (/@import\s+(?:url\()?["']?(?:https?:)?\/\//i.test(text)) {
        failures.push(`${label}: external CSS import`);
      }
      if (file.endsWith('.css')) {
        for (const match of text.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
          const url = match[1].trim();
          if (/^(data:|#)/i.test(url)) continue;
          if (/^(https?:)?\/\//i.test(url)) { failures.push(`${label}: external CSS resource ${url}`); continue; }
          const clean = decodeURIComponent(url.split(/[?#]/)[0]);
          const target = clean.startsWith('/') ? path.join(root, clean) : path.resolve(path.dirname(file), clean);
          if (!fs.existsSync(target)) failures.push(`${label}: missing CSS resource ${url}`);
        }
      }
    }
  }
  for (const file of ['index.html', 'wiki/index.html', 'sitemap.xml', 'wiki/sitemap.xml']) {
    if (!fs.existsSync(path.join(root, file))) failures.push(`Missing ${file}`);
  }
  visit(root);
  failures.push(...require('./check-wiki.cjs')({
    root,
    pages: wikiPages,
    themeSource: path.resolve(__dirname, '../themes/wiki/source')
  }));
  if (failures.length) throw new Error(failures.join('\n'));
  console.log(`Checked ${pages} HTML pages: local resources exist; Blog and Wiki outputs, Wiki asset versions and search index are valid.`);
}

module.exports = check;
if (require.main === module) check();
