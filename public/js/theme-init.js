/* Synchronous: choose the palette before any stylesheet can paint the page. */
(function () {
  'use strict';
  var saved;
  try { saved = localStorage.getItem('pophirasawa.blog.theme'); } catch (_) {}
  var theme = saved === 'light' || saved === 'dark' ? saved
    : window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.documentElement.dataset.theme = theme;
  document.getElementById('blog-theme-color').content = theme === 'dark' ? '#1c2023' : '#f2f5f4';
})();
