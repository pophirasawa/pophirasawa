'use strict';

// Infer missing categories from folders without replacing Hexo's post processor.
hexo.extend.filter.register('before_generate', async function () {
  const settings = this.config.auto_dir_categorize || {};
  if (settings.enable === false) return;
  const { parse } = require('hexo-front-matter');
  for (const post of this.model('Post').toArray()) {
    const front = parse(post.raw);
    const categories = front.categories || front.category;
    if (!settings.force && categories && (!Array.isArray(categories) || categories.length)) continue;
    const folders = post.source.replaceAll('\\', '/').split('/').slice(1, -1);
    if (folders.length) await post.setCategories(folders);
  }
  this.locals.invalidate();
});

// The old nofollow plugin brought in Cheerio 0.19 and Lodash 3.
hexo.extend.filter.register('after_render:html', function (html) {
  if (!this.config.nofollow?.enable) return html;
  const origin = new URL(this.config.url).hostname;
  const exclude = [].concat(this.config.nofollow.exclude || []);
  return html.replace(/<a\b[^>]*>/gi, tag => {
    const href = tag.match(/\bhref=(["'])(.*?)\1/i)?.[2];
    if (!href || !/^(https?:)?\/\//i.test(href)) return tag;
    const hostname = new URL(href, this.config.url).hostname;
    if (hostname === origin || exclude.includes(hostname)) return tag;
    const rel = tag.match(/\brel=(["'])(.*?)\1/i);
    const tokens = new Set((rel?.[2] || '').split(/\s+/).filter(Boolean));
    for (const token of ['nofollow', 'noopener', 'noreferrer']) tokens.add(token);
    const attr = `rel="${[...tokens].join(' ')}"`;
    return rel ? tag.replace(rel[0], attr) : tag.replace(/>$/, ' ' + attr + '>');
  });
});
