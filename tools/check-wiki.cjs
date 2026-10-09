'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { Script } = require('node:vm');

module.exports = function checkWiki({ root, pages, themeSource }) {
  const failures = [];
  const assets = new Map();
  for (const name of ['js/theme-init.js', 'css/main.css', 'js/main.js']) {
    const file = path.join(root, 'wiki', name);
    const source = path.join(themeSource, name);
    if (!fs.existsSync(file)) { failures.push(`Wiki: missing theme asset ${name}`); continue; }
    const data = fs.readFileSync(file);
    assets.set(name, crypto.createHash('sha256').update(data).digest('hex').slice(0, 10));
    if (!fs.existsSync(source) || !data.equals(fs.readFileSync(source))) failures.push(`Wiki: outdated generated theme asset ${name}; rebuild before publishing`);
    if (name.endsWith('.js')) {
      try { new Script(data.toString('utf8'), { filename: file }); }
      catch (error) { failures.push(`Wiki: invalid JavaScript ${name}: ${error.message}`); }
    }
  }
  for (const { label, text } of pages) {
    if (label.startsWith('wiki/wiki/')) continue;
    const positions = new Map();
    for (const name of assets.keys()) {
      const tag = [...text.matchAll(/<(?:script|link)\b[^>]*>/gi)].find(match => {
        const url = match[0].match(/\b(?:src|href)=["']([^"']+)["']/i)?.[1];
        return url?.split('?')[0] === '/wiki/' + name;
      });
      if (!tag) { failures.push(`${label}: missing Wiki theme reference ${name}`); continue; }
      positions.set(name, tag.index);
      const url = tag[0].match(/\b(?:src|href)=["']([^"']+)["']/i)[1];
      if (new URL(url, 'https://local.invalid').searchParams.get('v') !== assets.get(name)) failures.push(`${label}: stale Wiki asset version ${name}`);
      if (name === 'js/theme-init.js' && /\s(?:async|defer)(?:\s|=|>)|\btype=["']module["']/i.test(tag[0])) failures.push(`${label}: Wiki theme bootstrap must run synchronously before CSS`);
    }
    if (positions.get('js/theme-init.js') > positions.get('css/main.css')) failures.push(`${label}: Wiki theme bootstrap must run before CSS`);
    if (!/\bdata-index=["']\/wiki\/search\.json["']/i.test(text)) failures.push(`${label}: missing Wiki search index reference`);
  }

  try {
    const index = JSON.parse(fs.readFileSync(path.join(root, 'wiki/search.json'), 'utf8'));
    const posts = JSON.parse(fs.readFileSync(path.join(root, 'wiki/content.json'), 'utf8')).posts;
    if (!Array.isArray(index) || !Array.isArray(posts)) throw new Error('search index and published posts must be arrays');
    const expected = new Set(posts.map(post => '/wiki/' + decodeURIComponent(post.path).replace(/index\.html$/, '')));
    const found = new Set();
    for (const entry of index) {
      if (!entry || !['title', 'path', 'url', 'content'].every(key => typeof entry[key] === 'string') || !entry.title || !entry.path) {
        failures.push('Wiki: malformed search entry'); continue;
      }
      if (!entry.url.startsWith('/wiki/') || entry.url.startsWith('/wiki/wiki/')) {
        failures.push(`Wiki: noncanonical search URL ${entry.url}`); continue;
      }
      const url = new URL(entry.url, 'https://local.invalid');
      const canonical = decodeURIComponent(url.pathname).replace(/index\.html$/, '');
      if (url.search || url.hash || !expected.has(canonical)) failures.push(`Wiki: search entry does not match a published note ${entry.url}`);
      if (found.has(canonical)) failures.push(`Wiki: duplicate search entry ${entry.url}`);
      found.add(canonical);
      const target = path.join(root, canonical, 'index.html');
      if (!fs.existsSync(target)) failures.push(`Wiki: missing search target ${entry.url}`);
    }
    for (const url of expected) if (!found.has(url)) failures.push(`Wiki: published note missing from search ${url}`);
  } catch (error) {
    failures.push(`Wiki: could not validate search index: ${error.message}`);
  }
  return failures;
};
