'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const checkWiki = require('./check-wiki.cjs');

function fixture(t) {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'wiki-build-check-'));
  t.after(() => fs.rmSync(temporary, { recursive: true, force: true }));
  const root = path.join(temporary, 'public');
  const themeSource = path.join(temporary, 'theme');
  function write(file, data) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, data);
  }
  const tags = [];
  for (const [name, data] of [['js/theme-init.js', '(function () {})();'], ['css/main.css', 'body { color: teal; }'], ['js/main.js', '(function () {})();']]) {
    write(path.join(themeSource, name), data);
    write(path.join(root, 'wiki', name), data);
    const version = crypto.createHash('sha256').update(data).digest('hex').slice(0, 10);
    tags.push(name.endsWith('.css') ? `<link rel="stylesheet" href="/wiki/${name}?v=${version}">` : `<script src="/wiki/${name}?v=${version}"></script>`);
  }
  const entry = { title: '算法笔记', path: '算法/笔记', url: '/wiki/' + encodeURI('算法/笔记/'), content: '正文关键词' };
  write(path.join(root, 'wiki/算法/笔记/index.html'), '<h1>算法笔记</h1>');
  write(path.join(root, 'wiki/search.json'), JSON.stringify([entry]));
  write(path.join(root, 'wiki/content.json'), JSON.stringify({ posts: [{ path: '算法/笔记/' }] }));
  const pages = [{ label: 'wiki/index.html', text: tags.join('\n') + '<dialog data-index="/wiki/search.json"></dialog>' }, { label: 'wiki/wiki/算法/笔记/index.html', text: 'Legacy redirect' }];
  return { root, themeSource, pages, write, entry, run: () => checkWiki({ root, themeSource, pages }) };
}

test('accepts current assets, Chinese search URLs and legacy redirects', t => {
  assert.deepEqual(fixture(t).run(), []);
});

test('rejects old compiled assets after source changes', t => {
  const f = fixture(t);
  f.write(path.join(f.themeSource, 'js/main.js'), '(function () { const changed = true; })();');
  assert.match(f.run().join('\n'), /outdated generated theme asset js\/main.js/);
});

test('rejects stale cache versions in pages', t => {
  const f = fixture(t);
  f.pages[0].text = f.pages[0].text.replace(/main\.css\?v=[a-f0-9]+/, 'main.css?v=outdated');
  assert.match(f.run().join('\n'), /stale Wiki asset version css\/main.css/);
});

test('rejects deferred theme bootstrap and CSS before bootstrap', t => {
  const f = fixture(t);
  const lines = f.pages[0].text.split('\n');
  [lines[0], lines[1]] = [lines[1], lines[0].replace('<script ', '<script defer ')];
  f.pages[0].text = lines.join('\n');
  const failures = f.run().join('\n');
  assert.match(failures, /bootstrap must run synchronously/);
  assert.match(failures, /bootstrap must run before CSS/);
});

test('rejects a search index that omits a published note', t => {
  const f = fixture(t);
  f.write(path.join(f.root, 'wiki/search.json'), '[]');
  assert.match(f.run().join('\n'), /published note missing from search/);
});

test('rejects duplicate search entries and doubled Wiki paths', t => {
  const f = fixture(t);
  f.write(path.join(f.root, 'wiki/search.json'), JSON.stringify([f.entry, f.entry, { ...f.entry, url: '/wiki/wiki/note/' }]));
  const failures = f.run().join('\n');
  assert.match(failures, /duplicate search entry/);
  assert.match(failures, /noncanonical search URL/);
});

test('rejects broken JavaScript without executing browser code', t => {
  const f = fixture(t);
  f.write(path.join(f.root, 'wiki/js/main.js'), 'function broken(');
  assert.match(f.run().join('\n'), /invalid JavaScript js\/main.js/);
});
