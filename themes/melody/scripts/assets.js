'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

// Version these small theme assets by content, independently of Melody's version.
hexo.extend.helper.register('blog_asset', function (asset) {
  const source = asset === 'vendor/diagrams.js'
    ? path.join(hexo.base_dir, 'tools/diagrams.js') : path.join(__dirname, '../source', asset);
  const version = createHash('sha256').update(fs.readFileSync(source)).digest('hex').slice(0, 10);
  return this.url_for('/' + asset) + '?v=' + version;
});
