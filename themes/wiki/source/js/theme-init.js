/* Run before the stylesheet so a saved night theme never flashes white. */
(function () {
  'use strict';
  let preference;
  try { preference = localStorage.getItem('pophirasawa.wiki.theme'); } catch (_) {}
  const theme = preference === 'light' || preference === 'dark'
    ? preference : window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.documentElement.dataset.theme = theme;
})();
