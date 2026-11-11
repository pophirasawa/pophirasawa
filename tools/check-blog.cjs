'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { Script } = require('node:vm');

function attributes(tag) {
  const result = new Map();
  for (const match of tag.matchAll(/\s([a-z][a-z0-9:-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/gi)) {
    result.set(match[1].toLowerCase(), match[2] ?? match[3] ?? match[4] ?? '');
  }
  return result;
}

module.exports = function checkBlog({ root, pages, themeSource, diagramSource }) {
  const failures = [];
  const versions = new Map();
  const required = ['css/theme.css', 'js/theme.js'];
  const bootstrapSource = path.join(themeSource, 'js/theme-init.js');
  for (const name of ['js/theme-init.js', ...required, 'vendor/diagrams.js']) {
    const file = path.join(root, name);
    const source = name === 'vendor/diagrams.js' ? diagramSource : path.join(themeSource, name);
    if (!fs.existsSync(file)) { failures.push(`Blog: missing theme asset ${name}`); continue; }
    const data = fs.readFileSync(file);
    versions.set(name, createHash('sha256').update(data).digest('hex').slice(0, 10));
    if (!fs.existsSync(source) || !data.equals(fs.readFileSync(source))) {
      failures.push(`Blog: outdated generated theme asset ${name}; rebuild before publishing`);
    }
    if (name.endsWith('.js')) {
      try { new Script(data.toString('utf8'), { filename: file }); }
      catch (error) { failures.push(`Blog: invalid JavaScript ${name}: ${error.message}`); }
    }
  }
  for (const { label, text } of pages) {
    const tags = [...text.matchAll(/<(script|link|meta|button)\b[^>]*>/gi)].map(match => ({
      type: match[1].toLowerCase(), index: match.index, attrs: attributes(match[0])
    }));
    const references = new Map();
    for (const tag of tags) {
      if (tag.type === 'script' && tag.attrs.has('src') && !tag.attrs.has('defer')
        && !tag.attrs.has('async') && tag.attrs.get('type') !== 'module') {
        failures.push(`${label}: parser-blocking Blog script ${tag.attrs.get('src')}; use defer to keep content readable`);
      }
    }
    for (const name of versions.keys()) {
      if (name === 'js/theme-init.js') continue;
      const matches = tags.filter(tag => {
        const url = tag.attrs.get('src') || tag.attrs.get('href');
        return url?.split(/[?#]/)[0] === '/' + name;
      });
      if (!matches.length) {
        if (required.includes(name)) failures.push(`${label}: missing Blog theme reference ${name}`);
        continue;
      }
      if (matches.length > 1) failures.push(`${label}: duplicate Blog theme reference ${name}`);
      const tag = matches[0];
      references.set(name, tag);
      const url = tag.attrs.get('src') || tag.attrs.get('href');
      if (new URL(url, 'https://local.invalid').searchParams.get('v') !== versions.get(name)) {
        failures.push(`${label}: stale Blog asset version ${name}`);
      }
      if (name.endsWith('.css')) {
        if (tag.type !== 'link' || tag.attrs.get('rel')?.toLowerCase() !== 'stylesheet') {
          failures.push(`${label}: Blog theme CSS must be a stylesheet`);
        }
      } else if (tag.type !== 'script' || !tag.attrs.has('src')) {
        failures.push(`${label}: Blog theme script must use a script tag: ${name}`);
      }
    }
    const bootstraps = tags.filter(tag => tag.type === 'script' && tag.attrs.has('data-blog-theme-init'));
    const bootstrap = bootstraps[0];
    if (!bootstrap) failures.push(`${label}: missing inline Blog theme bootstrap`);
    if (bootstraps.length > 1) failures.push(`${label}: duplicate Blog theme bootstrap`);
    if (bootstrap) {
      if (bootstrap.attrs.has('src')) failures.push(`${label}: Blog theme bootstrap must be inline to avoid a blocking request`);
      const code = text.slice(text.indexOf('>', bootstrap.index) + 1, text.indexOf('</script>', bootstrap.index)).trim();
      if (!fs.existsSync(bootstrapSource) || code !== fs.readFileSync(bootstrapSource, 'utf8').replace(/<\/script/gi, '<\\/script').trim()) {
        failures.push(`${label}: outdated inline Blog theme bootstrap; rebuild before publishing`);
      }
      if (bootstrap.attrs.has('async') || bootstrap.attrs.has('defer') || bootstrap.attrs.get('type') === 'module') {
        failures.push(`${label}: Blog theme bootstrap must run synchronously before CSS`);
      }
      const firstCSS = tags.find(tag => tag.type === 'link' && tag.attrs.get('rel')?.toLowerCase() === 'stylesheet');
      if (firstCSS && bootstrap.index > firstCSS.index) failures.push(`${label}: Blog theme bootstrap must run before CSS`);
      const meta = tags.find(tag => tag.type === 'meta' && tag.attrs.get('id') === 'blog-theme-color' && tag.attrs.get('name') === 'theme-color');
      if (!meta || meta.index > bootstrap.index) failures.push(`${label}: Blog theme-color meta must precede bootstrap`);
    }
    const runtime = references.get('js/theme.js');
    if (runtime && (!runtime.attrs.has('defer') || runtime.attrs.has('async'))) {
      failures.push(`${label}: Blog theme controls must use defer without async`);
    }
    const baseCSS = tags.find(tag => tag.type === 'link' && tag.attrs.get('href')?.split('?')[0] === '/css/index.css');
    const palette = references.get('css/theme.css');
    if (baseCSS && palette && palette.index < baseCSS.index) failures.push(`${label}: Blog theme palette must follow base CSS`);
    const toggle = tags.find(tag => tag.type === 'button' && tag.attrs.get('class')?.split(/\s+/).includes('blog-theme-toggle'));
    if (!toggle || toggle.attrs.get('type') !== 'button' || !toggle.attrs.get('aria-label')?.trim()
      || !['true', 'false'].includes(toggle.attrs.get('aria-pressed'))) {
      failures.push(`${label}: missing accessible Blog theme toggle`);
    }
  }
  return failures;
};
