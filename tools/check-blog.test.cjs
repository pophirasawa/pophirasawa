'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createHash } = require('node:crypto');
const checkBlog = require('./check-blog.cjs');

function fixture(t) {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'blog-build-check-'));
  t.after(() => fs.rmSync(temporary, { recursive: true, force: true }));
  const root = path.join(temporary, 'public');
  const themeSource = path.join(temporary, 'theme');
  const diagramSource = path.join(temporary, 'diagrams.js');
  function write(file, data) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, data);
  }
  const tags = ['<meta id="blog-theme-color" name="theme-color" content="#f2f5f4">'];
  for (const [name, data] of [
    ['js/theme-init.js', '(function () {})();'],
    ['css/theme.css', 'body { color: teal; }'],
    ['js/theme.js', '(function () {})();'],
    ['vendor/diagrams.js', '(function () {})();']
  ]) {
    write(name.startsWith('vendor/') ? diagramSource : path.join(themeSource, name), data);
    write(path.join(root, name), data);
    const version = createHash('sha256').update(data).digest('hex').slice(0, 10);
    if (name.endsWith('.css')) tags.push('<link rel="stylesheet" href="/css/index.css?version=2.9.0">');
    tags.push(name.endsWith('.css') ? `<link rel="stylesheet" href="/${name}?v=${version}">`
      : `<script src="/${name}?v=${version}"${name === 'js/theme-init.js' ? '' : ' defer'}></script>`);
  }
  tags.push('<button class="blog-theme-toggle pull-right" type="button" aria-label="切换到夜间主题" aria-pressed="false"></button>');
  const pages = [{ label: 'index.html', text: tags.join('\n') }];
  return { root, themeSource, diagramSource, pages, write, run: () => checkBlog({ root, themeSource, diagramSource, pages }) };
}

test('accepts current Blog assets and a synchronous bootstrap', t => {
  const f = fixture(t);
  assert.deepEqual(f.run(), []);
  // A site may disable diagrams without disabling day/night themes.
  f.pages[0].text = f.pages[0].text.replace(/<script src="\/vendor\/diagrams\.js[^<]+<\/script>/, '');
  assert.deepEqual(f.run(), []);
});

test('rejects stale compiled palettes and diagram scripts', t => {
  const f = fixture(t);
  f.write(path.join(f.themeSource, 'css/theme.css'), 'body { color: red; }');
  f.write(f.diagramSource, '(function () { const changed = true; })();');
  const failures = f.run().join('\n');
  assert.match(failures, /outdated generated theme asset css\/theme.css/);
  assert.match(failures, /outdated generated theme asset vendor\/diagrams.js/);
});

test('rejects stale cache versions and duplicate scripts', t => {
  const f = fixture(t);
  f.pages[0].text = f.pages[0].text.replace(/theme\.css\?v=[a-f0-9]+/, 'theme.css?v=outdated');
  f.pages[0].text += f.pages[0].text.match(/<script src="\/js\/theme\.js[^<]+<\/script>/)[0];
  const failures = f.run().join('\n');
  assert.match(failures, /stale Blog asset version css\/theme.css/);
  assert.match(failures, /duplicate Blog theme reference js\/theme.js/);
});

test('rejects asynchronous bootstrap and CSS that would paint first', t => {
  const f = fixture(t);
  f.pages[0].text = '<link rel="stylesheet" href="/css/index.css">' + f.pages[0].text.replace('<script ', '<script async ');
  const failures = f.run().join('\n');
  assert.match(failures, /bootstrap must run synchronously/);
  assert.match(failures, /bootstrap must run before CSS/);
});

test('rejects controls that run before the DOM and a palette before base styles', t => {
  const f = fixture(t);
  f.pages[0].text = f.pages[0].text.replace(' defer', ' async');
  const base = '<link rel="stylesheet" href="/css/index.css?version=2.9.0">';
  f.pages[0].text = f.pages[0].text.replace(base, '') + base;
  const failures = f.run().join('\n');
  assert.match(failures, /controls must use defer without async/);
  assert.match(failures, /palette must follow base CSS/);
});

test('rejects missing controls, browser color metadata and asset references', t => {
  const f = fixture(t);
  f.pages[0].text = f.pages[0].text.replace(/<meta[^>]*>/, '').replace(/<button[^>]*><\/button>/, '')
    .replace(/<script src="\/js\/theme\.js[^<]+<\/script>/, '');
  const failures = f.run().join('\n');
  assert.match(failures, /missing accessible Blog theme toggle/);
  assert.match(failures, /theme-color meta must precede bootstrap/);
  assert.match(failures, /missing Blog theme reference js\/theme.js/);
});

test('rejects missing files and invalid JavaScript without executing it', t => {
  const f = fixture(t);
  f.write(path.join(f.root, 'js/theme.js'), 'function broken(');
  fs.unlinkSync(path.join(f.root, 'css/theme.css'));
  const failures = f.run().join('\n');
  assert.match(failures, /invalid JavaScript js\/theme.js/);
  assert.match(failures, /missing theme asset css\/theme.css/);
});

test('rejects an empty button label and invalid toggle state', t => {
  const f = fixture(t);
  f.pages[0].text = f.pages[0].text.replace('切换到夜间主题', '').replace('aria-pressed="false"', 'aria-pressed="maybe"');
  assert.match(f.run().join('\n'), /missing accessible Blog theme toggle/);
});
