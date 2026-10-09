'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
for (const name of ['public', 'db.json']) fs.rmSync(path.join(root, name), { recursive: true, force: true });
console.log('Removed generated public/ and Hexo cache. Run npm run build to regenerate both sites.');
