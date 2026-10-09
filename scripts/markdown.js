'use strict';

const MarkdownIt = require('markdown-it');
const path = require('node:path');
const { url_for } = require('hexo-util');
const md = new MarkdownIt(hexo.config.markdown.render);
require('../tools/markdown-extensions.cjs')(md);

const renderImage = md.renderer.rules.image;
md.renderer.rules.image = function (tokens, index, options, env, self) {
  const token = tokens[index];
  token.attrSet('loading', 'lazy');
  // Markdown-it normalizes Chinese filenames into percent-encoded URLs.
  // Decode for the filesystem lookup, then let Hexo encode the final URL.
  const src = decodeURIComponent(token.attrGet('src') || '');
  if (hexo.config.post_asset_folder && env.postPath && src && !/^(?:\/|#|[a-z]+:)/i.test(src)) {
    const stem = path.basename(env.postPath, path.extname(env.postPath));
    const relative = src.startsWith(stem + '/') ? src.slice(stem.length + 1) : src;
    const assetId = path.relative(hexo.base_dir, path.join(path.dirname(env.postPath), stem, relative)).replaceAll('\\', '/');
    const asset = hexo.model('PostAsset').findById(assetId);
    if (asset) token.attrSet('src', url_for.call(hexo, asset.path));
  }
  return renderImage.call(this, tokens, index, options, env, self);
};

function render(data, options) {
  return options?.inline ? md.renderInline(data.text, { postPath: data.path }) : md.render(data.text, { postPath: data.path });
}
for (const ext of ['md', 'markdown', 'mkd', 'mkdn', 'mdwn', 'mdtxt', 'mdtext']) {
  hexo.extend.renderer.register(ext, 'html', render, true);
}
