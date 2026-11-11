(function () {
  'use strict';
  var root = document.documentElement;
  var key = 'pophirasawa.blog.theme';
  var button = document.querySelector('.blog-theme-toggle');
  var system = window.matchMedia('(prefers-color-scheme: dark)');
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var preference;
  var timer;
  try { preference = localStorage.getItem(key); } catch (_) {}

  function apply(theme, remember) {
    if (remember && !motion.matches) {
      clearTimeout(timer);
      root.classList.add('blog-theme-transition');
      timer = setTimeout(function () { root.classList.remove('blog-theme-transition'); }, 240);
    }
    root.dataset.theme = theme;
    document.getElementById('blog-theme-color').content = theme === 'dark' ? '#202124' : '#f2f5f4';
    var label = theme === 'dark' ? '切换到日间主题' : '切换到夜间主题';
    button.setAttribute('aria-label', label);
    button.setAttribute('aria-pressed', String(theme === 'dark'));
    button.title = label;
    if (remember) {
      preference = theme;
      try { localStorage.setItem(key, theme); } catch (_) {}
    }
  }

  button.addEventListener('click', function () { apply(root.dataset.theme === 'dark' ? 'light' : 'dark', true); });
  system.addEventListener('change', function (event) {
    if (preference !== 'light' && preference !== 'dark') apply(event.matches ? 'dark' : 'light');
  });
  window.addEventListener('storage', function (event) {
    if (event.key !== key && event.key !== null) return;
    preference = event.newValue;
    apply(preference === 'light' || preference === 'dark' ? preference : system.matches ? 'dark' : 'light');
  });
  motion.addEventListener('change', function () {
    if (motion.matches) {
      clearTimeout(timer);
      root.classList.remove('blog-theme-transition');
    }
  });
  apply(root.dataset.theme);
  button.hidden = false;
})();
