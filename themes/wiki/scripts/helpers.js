'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { escapeHTML, stripHTML, unescapeHTML, url_for } = require('hexo-util');

const label = value => value.replace(/^\d+[\s._-]*/, '') || value;
const title = post => post.title || post.slug?.split('/').at(-1) || '未命名笔记';
const plain = html => unescapeHTML(stripHTML((html || '').replace(/<annotation\b[^>]*>[\s\S]*?<\/annotation>/gi, ''))).replace(/\s+/g, ' ').trim();
const url = value => url_for.call(hexo, value);
const sort = (a, b) => a.slug.localeCompare(b.slug, 'zh-CN', { numeric: true });

function structure() {
  const posts = hexo.locals.get('posts').toArray().sort(sort);
  const root = { children: [], folders: new Map() };
  for (const post of posts) {
    const parts = post.slug.split('/').filter(Boolean);
    let node = root;
    let prefix = '';
    for (const key of parts.slice(0, -1)) {
      prefix += key + '/';
      if (!node.folders.has(key)) {
        const folder = { kind: 'folder', key, label: label(key), slug: prefix, children: [], folders: new Map(), posts: [] };
        node.folders.set(key, folder);
        node.children.push(folder);
      }
      node = node.folders.get(key);
      node.posts.push(post);
    }
    node.children.push({ kind: 'note', post, slug: post.slug, label: title(post) });
  }
  return {
    groups: root.children.filter(node => node.kind === 'folder'),
    loose: root.children.filter(node => node.kind === 'note'),
    posts,
    recent: [...posts].sort((a, b) => +b.updated - +a.updated).slice(0, 5)
  };
}

const icons = {
  search: '<circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  moon: '<path d="M20.5 13.1A8.7 8.7 0 0 1 10.9 3.5 8.8 8.8 0 1 0 20.5 13.1Z"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10H3Z"/>',
  note: '<path d="M6 3h8l4 4v14H6Z"/><path d="M14 3v5h4M9 12h6M9 16h6"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  home: '<path d="m3 10 9-7 9 7M5 9v12h14V9M10 21v-7h4v7"/>',
  arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
  link: '<path d="m10 13 4-4M8 16l-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m2 1 1-1a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0"/>',
  copy: '<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',
  check: '<path d="m5 12 4 4 10-10"/>',
  top: '<path d="m6 12 6-6 6 6M12 6v14"/>',
  list: '<path d="M9 6h12M9 12h12M9 18h12M3 6h.01M3 12h.01M3 18h.01"/>'
};
function icon(name) {
  return `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${icons[name] || icons.note}</svg>`;
}

hexo.extend.helper.register('wiki_icon', icon);
hexo.extend.helper.register('wiki_structure', structure);
hexo.extend.helper.register('wiki_title', title);
hexo.extend.helper.register('wiki_label', label);
hexo.extend.helper.register('wiki_plain', plain);
hexo.extend.helper.register('wiki_asset', function (file) {
  const source = path.join(hexo.theme_dir, 'source', file);
  const digest = crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex').slice(0, 10);
  return url(file) + '?v=' + digest;
});
hexo.extend.helper.register('wiki_breadcrumbs', function (post) {
  const folders = post.slug?.split('/').slice(0, -1) || [];
  const categories = hexo.locals.get('categories').toArray();
  return folders.map(name => ({ label: label(name), href: categories.find(c => c.name === name)?.path }));
});
hexo.extend.helper.register('wiki_tree', function (currentSlug) {
  const data = structure();
  function render(nodes) {
    return '<ul class="directory-list">' + nodes.map(node => {
      if (node.kind === 'note') {
        const active = node.slug === currentSlug;
        return `<li class="directory-note"><a href="${escapeHTML(url(node.post.path))}"${active ? ' class="is-current" aria-current="page"' : ''}>${icon('note')}<span>${escapeHTML(node.label)}</span></a></li>`;
      }
      const active = node.posts.some(post => post.slug === currentSlug);
      return `<li class="directory-folder"><details${active ? ' open' : ''}><summary>${icon('chevron')}${icon('folder')}<span>${escapeHTML(node.label)}</span><span class="folder-count">${node.posts.length}</span></summary>${render(node.children)}</details></li>`;
    }).join('') + '</ul>';
  }
  return render(data.groups) + (data.loose.length ? '<div class="sidebar-section-label">其他笔记</div>' + render(data.loose) : '');
});

hexo.extend.generator.register('wiki-search', function (locals) {
  const index = locals.posts.toArray().sort(sort).map(post => ({
    title: title(post),
    path: post.slug,
    url: url(post.path),
    content: plain(post.content)
  }));
  return { path: 'search.json', data: JSON.stringify(index) };
});

hexo.extend.generator.register('wiki-404', function () {
  return { path: '404.html', layout: '404', data: { title: '页面不存在' } };
});
