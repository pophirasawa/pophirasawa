'use strict';

// Keep the original Markdown extensions and heading IDs with a maintained parser.
module.exports = function (md) {
  for (const name of ['markdown-it-sub', 'markdown-it-sup', 'markdown-it-deflist',
    'markdown-it-abbr', 'markdown-it-footnote', 'markdown-it-ins', 'markdown-it-mark', 'markdown-it-emoji']) {
    md.use(require(name));
  }
  md.use(require('@vscode/markdown-it-katex').default, { throwOnError: false });
  const slug = require('uslug');
  md.core.ruler.push('legacy_heading_ids', state => {
    const counts = new Map();
    for (let i = 0; i < state.tokens.length; i++) {
      const token = state.tokens[i];
      if (token.type !== 'heading_open') continue;
      const children = state.tokens[i + 1].children || [];
      const text = children[0]?.type === 'link_open'
        ? children[1].content : children.map(child => child.content).join('');
      const id = slug(text);
      const count = (counts.get(id) || 0) + 1;
      counts.set(id, count);
      token.attrSet('id', id + (count > 1 ? '-' + count : ''));
    }
  });
};
