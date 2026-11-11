/* Synchronous: choose the palette before any stylesheet can paint the page. */
(function () {
  'use strict';
  var saved;
  try { saved = localStorage.getItem('pophirasawa.blog.theme'); } catch (_) {}
  var theme = saved === 'dark' ? 'dark' : 'light';
  document.documentElement.dataset.theme = theme;
  document.getElementById('blog-theme-color').content = theme === 'dark' ? '#202124' : '#ffffff';
})();
