'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

function styleSources(folder) {
  return fs.readdirSync(folder, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name)).flatMap(entry => {
    const file = path.join(folder, entry.name);
    return entry.isDirectory() ? styleSources(file) : [fs.readFileSync(file)];
  });
}
const styleVersion = createHash('sha256').update(Buffer.concat(styleSources(path.join(__dirname, '../source/css')))).digest('hex').slice(0, 10);

hexo.extend.helper.register('blog_theme_bootstrap', function () {
  return fs.readFileSync(path.join(__dirname, '../source/js/theme-init.js'), 'utf8').replace(/<\/script/gi, '<\\/script');
});

// Version these small theme assets by content, independently of Melody's version.
hexo.extend.helper.register('blog_asset', function (asset) {
  if (asset === 'css/index.css') return this.url_for('/' + asset) + '?v=' + styleVersion;
  const source = asset === 'vendor/diagrams.js'
    ? path.join(hexo.base_dir, 'tools/diagrams.js') : path.join(__dirname, '../source', asset);
  const version = createHash('sha256').update(fs.readFileSync(source)).digest('hex').slice(0, 10);
  return this.url_for('/' + asset) + '?v=' + version;
});
