'use strict';

const fs = require('node:fs');
const path = require('node:path');
const Hexo = require('hexo');
const root = path.resolve(__dirname, '..');

async function generate(config) {
  // Blog and Wiki must have separate in-memory databases; never run together.
  const hexo = new Hexo(root, { config });
  const errors = [];
  const logError = hexo.log.error;
  hexo.log.error = function (...args) {
    errors.push(args.map(String).join(' '));
    return logError.apply(this, args);
  };
  try {
    await hexo.init();
    if (errors.length) throw new Error(errors.join('\n'));
    await hexo.call('clean');
    await hexo.call('generate');
    if (errors.length) throw new Error(errors.join('\n'));
    if (config === '_config_wiki.yml') {
      for (const post of hexo.locals.get('posts').toArray()) {
        // The old permalink generated /wiki/wiki/...; preserve inbound links.
        const alias = path.join(root, 'public/wiki/wiki', post.path, 'index.html');
        const canonical = new URL(post.path, 'https://pophirasawa.top/wiki/').href;
        const local = '/wiki/' + post.path;
        const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
        fs.mkdirSync(path.dirname(alias), { recursive: true });
        fs.writeFileSync(alias, `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="robots" content="noindex"><link rel="canonical" href="${escape(canonical)}"><meta http-equiv="refresh" content="0;url=${escape(local)}"><title>页面已迁移</title></head><body><a href="${escape(local)}">前往原文章</a></body></html>\n`);
      }
    }
  } finally {
    await hexo.exit();
  }
}

async function build() {
  await generate('_config.yml');
  await generate('_config_wiki.yml');
  require('./vendor.cjs')();
  require('./check.cjs')();
}

build().catch(error => { console.error(error); process.exitCode = 1; });
