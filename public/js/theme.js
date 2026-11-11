(function () {
  'use strict';
  var root = document.documentElement;
  var key = 'pophirasawa.blog.theme';
  var button = document.querySelector('.blog-theme-toggle');
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var timer;

  function apply(theme, remember) {
    if (remember && !motion.matches) {
      clearTimeout(timer);
      root.classList.add('blog-theme-transition');
      timer = setTimeout(function () { root.classList.remove('blog-theme-transition'); }, 240);
    }
    root.dataset.theme = theme;
    document.getElementById('blog-theme-color').content = theme === 'dark' ? '#202124' : '#ffffff';
    var label = theme === 'dark' ? '切换到日间主题' : '切换到夜间主题';
    button.setAttribute('aria-label', label);
    button.setAttribute('aria-pressed', String(theme === 'dark'));
    button.title = label;
    if (remember) {
      try { localStorage.setItem(key, theme); } catch (_) {}
    }
  }

  button.addEventListener('click', function () { apply(root.dataset.theme === 'dark' ? 'light' : 'dark', true); });
  window.addEventListener('storage', function (event) {
    if (event.key !== key && event.key !== null) return;
    apply(event.newValue === 'dark' ? 'dark' : 'light');
  });
  motion.addEventListener('change', function () {
    if (motion.matches) {
      clearTimeout(timer);
      root.classList.remove('blog-theme-transition');
    }
  });
  apply(root.dataset.theme === 'dark' ? 'dark' : 'light');
  button.hidden = false;
})();
