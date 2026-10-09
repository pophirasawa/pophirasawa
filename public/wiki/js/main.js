(function () {
  'use strict';

  const root = document.documentElement;
  const themeKey = 'pophirasawa.wiki.theme';
  const themeButton = document.getElementById('theme-toggle');
  const announcement = document.getElementById('wiki-announcement');
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let themeTransitionTimer;
  let preference;
  try { preference = localStorage.getItem(themeKey); } catch (_) {}
  const say = text => { announcement.textContent = text; };
  reducedMotion.addEventListener('change', () => {
    if (!reducedMotion.matches) return;
    clearTimeout(themeTransitionTimer);
    root.classList.remove('theme-transition');
    themeButton.getAnimations({ subtree: true }).forEach(animation => animation.cancel());
  });

  function applyTheme(theme, remember = false) {
    if (remember && !reducedMotion.matches) {
      clearTimeout(themeTransitionTimer);
      root.classList.add('theme-transition');
      themeTransitionTimer = setTimeout(() => root.classList.remove('theme-transition'), 260);
    }
    root.dataset.theme = theme;
    themeButton.setAttribute('aria-label', theme === 'dark' ? '切换到日间主题' : '切换到夜间主题');
    themeButton.setAttribute('aria-pressed', String(theme === 'dark'));
    themeButton.title = themeButton.getAttribute('aria-label');
    if (remember) {
      preference = theme;
      try { localStorage.setItem(themeKey, theme); } catch (_) {}
      say(theme === 'dark' ? '已切换到夜间主题' : '已切换到日间主题');
      if (!reducedMotion.matches) {
        themeButton.querySelector(theme === 'dark' ? '.theme-sun' : '.theme-moon').animate(
          [{ transform: 'rotate(-30deg)', opacity: .5 }, { transform: 'rotate(0)', opacity: 1 }],
          { duration: 240, easing: 'cubic-bezier(.2,.7,.2,1)' }
        );
      }
    }
    renderDiagrams();
  }
  themeButton.addEventListener('click', () => applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true));
  systemTheme.addEventListener('change', event => {
    if (preference !== 'dark' && preference !== 'light') applyTheme(event.matches ? 'dark' : 'light');
  });
  window.addEventListener('storage', event => {
    if (event.key !== themeKey) return;
    preference = event.newValue;
    applyTheme(preference === 'dark' || preference === 'light' ? preference : systemTheme.matches ? 'dark' : 'light');
  });

  // Keep native details semantics; reverse interrupted folds from their current height.
  document.querySelectorAll('.directory-folder details').forEach(details => {
    const summary = details.querySelector(':scope > summary');
    const panel = details.querySelector(':scope > .directory-list');
    let expanded = details.open;
    let animation;
    function settle() {
      animation?.cancel();
      animation = undefined;
      details.open = expanded;
      panel.style.removeProperty('overflow');
    }
    summary.addEventListener('click', event => {
      if (reducedMotion.matches) return;
      event.preventDefault();
      const height = details.open ? panel.getBoundingClientRect().height : 0;
      expanded = animation ? !expanded : !details.open;
      animation?.cancel();
      details.open = true;
      panel.style.overflow = 'hidden';
      animation = panel.animate(
        [{ height: height + 'px' }, { height: (expanded ? panel.scrollHeight : 0) + 'px' }],
        { duration: 200, easing: 'cubic-bezier(.2,.7,.2,1)' }
      );
      const current = animation;
      current.finished.then(() => { if (animation === current) settle(); }).catch(() => {});
    });
    reducedMotion.addEventListener('change', () => {
      if (reducedMotion.matches && animation) settle();
    });
  });

  // Mobile directory: focus remains in the drawer until it is dismissed.
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebarClose = document.getElementById('sidebar-close');
  const backdrop = document.getElementById('sidebar-backdrop');
  const main = document.getElementById('content');
  const mobile = window.matchMedia('(max-width: 800px)');
  let directoryFocus;

  function closeDirectory(restore = true) {
    sidebar.classList.remove('is-open');
    sidebar.removeAttribute('role');
    sidebar.removeAttribute('aria-modal');
    sidebarToggle.setAttribute('aria-expanded', 'false');
    backdrop.hidden = true;
    main.inert = false;
    document.body.classList.remove('directory-open');
    if (restore && directoryFocus) directoryFocus.focus();
  }
  function openDirectory() {
    if (!mobile.matches) return;
    directoryFocus = document.activeElement;
    sidebar.classList.add('is-open');
    sidebar.setAttribute('role', 'dialog');
    sidebar.setAttribute('aria-modal', 'true');
    sidebarToggle.setAttribute('aria-expanded', 'true');
    backdrop.hidden = false;
    main.inert = true;
    document.body.classList.add('directory-open');
    sidebarClose.focus();
  }
  sidebarToggle.addEventListener('click', () => sidebar.classList.contains('is-open') ? closeDirectory() : openDirectory());
  sidebarClose.addEventListener('click', () => closeDirectory());
  backdrop.addEventListener('click', () => closeDirectory());
  sidebar.addEventListener('click', event => { if (event.target.closest('a')) closeDirectory(false); });
  mobile.addEventListener('change', () => { if (!mobile.matches) closeDirectory(false); });

  // Search index is loaded only when requested, then reused for this page.
  const dialog = document.getElementById('search-dialog');
  const searchButton = document.getElementById('search-toggle');
  const input = document.getElementById('search-input');
  const list = document.getElementById('search-results');
  const status = document.getElementById('search-status');
  const retry = document.getElementById('search-retry');
  let indexPromise;
  let index;
  let results = [];
  let selected = 0;
  let searchFocus;

  const normalize = value => value.normalize('NFKC').toLocaleLowerCase().trim();
  function selectResult(next, scroll = true) {
    if (!results.length) { input.removeAttribute('aria-activedescendant'); return; }
    selected = (next + results.length) % results.length;
    [...list.children].forEach((item, i) => item.setAttribute('aria-selected', String(i === selected)));
    input.setAttribute('aria-activedescendant', 'search-result-' + selected);
    if (scroll) list.children[selected].scrollIntoView({ block: 'nearest' });
  }
  function highlight(parent, text, terms) {
    if (!terms.length) { parent.textContent = text; return; }
    const escaped = terms.map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(escaped.join('|'), 'giu');
    let offset = 0;
    for (const match of text.matchAll(regex)) {
      parent.append(document.createTextNode(text.slice(offset, match.index)));
      const mark = document.createElement('mark');
      mark.textContent = match[0];
      parent.append(mark);
      offset = match.index + match[0].length;
    }
    parent.append(document.createTextNode(text.slice(offset)));
  }
  function renderSearch() {
    if (!index) return;
    const query = normalize(input.value);
    const terms = query.split(/\s+/).filter(Boolean);
    results = index.map(entry => {
      const noteTitle = normalize(entry.title);
      const notePath = normalize(entry.path);
      const content = normalize(entry.content);
      if (!terms.every(term => (noteTitle + ' ' + notePath + ' ' + content).includes(term))) return null;
      const score = terms.reduce((total, term) => total + (noteTitle.startsWith(term) ? 100 : noteTitle.includes(term) ? 70 : notePath.includes(term) ? 40 : 10), 0);
      return { entry, score };
    }).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 20);
    list.replaceChildren();
    retry.hidden = true;
    status.textContent = query ? results.length ? `找到 ${results.length} 篇笔记` : '没有找到笔记，试试其他标题或正文关键词。' : '全部笔记，输入关键词筛选。';
    results.forEach(({ entry }, i) => {
      const item = document.createElement('li');
      item.id = 'search-result-' + i;
      item.setAttribute('role', 'option');
      const link = document.createElement('a');
      link.href = entry.url;
      link.tabIndex = -1;
      const title = document.createElement('span');
      title.className = 'search-result-title';
      highlight(title, entry.title, terms);
      const path = document.createElement('span');
      path.className = 'search-result-path';
      highlight(path, entry.path.split('/').map(part => part.replace(/^\d+[\s._-]*/, '') || part).join(' / '), terms);
      const excerpt = document.createElement('p');
      excerpt.className = 'search-result-excerpt';
      const match = terms.length ? normalize(entry.content).indexOf(terms[0]) : -1;
      const start = Math.max(0, match - 35);
      const text = entry.content.slice(start, start + 130);
      highlight(excerpt, (start ? '…' : '') + text + (start + 130 < entry.content.length ? '…' : ''), terms);
      link.append(title, path, excerpt);
      item.append(link);
      item.addEventListener('pointermove', () => selectResult(i, false));
      list.append(item);
    });
    selected = 0;
    selectResult(0, false);
  }
  async function loadSearch() {
    status.textContent = '正在加载笔记…';
    retry.hidden = true;
    try {
      indexPromise ||= fetch(dialog.dataset.index).then(response => {
        if (!response.ok) throw new Error('Search index unavailable');
        return response.json();
      });
      index = await indexPromise;
      renderSearch();
    } catch (_) {
      indexPromise = undefined;
      status.textContent = '搜索未能加载，请重试。';
      retry.hidden = false;
    }
  }
  function openSearch() {
    searchFocus = sidebar.contains(document.activeElement) ? sidebarToggle : document.activeElement;
    if (sidebar.classList.contains('is-open')) closeDirectory(false);
    if (!dialog.open) dialog.showModal();
    input.focus();
    if (index) renderSearch(); else loadSearch();
  }
  searchButton.addEventListener('click', openSearch);
  document.getElementById('search-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => { if (searchFocus) searchFocus.focus(); });
  input.addEventListener('input', renderSearch);
  input.addEventListener('keydown', event => {
    if (event.isComposing) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      selectResult(selected + (event.key === 'ArrowDown' ? 1 : -1));
    } else if (event.key === 'Enter' && results[selected]) {
      event.preventDefault();
      window.location.assign(results[selected].entry.url);
    }
  });
  retry.addEventListener('click', loadSearch);
  if (/Mac|iPhone|iPad/.test(navigator.platform)) searchButton.querySelector('kbd').textContent = '⌘ K';

  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      openSearch();
    }
    if (!sidebar.classList.contains('is-open')) return;
    if (event.key === 'Escape') { event.preventDefault(); closeDirectory(); }
    if (event.key === 'Tab') {
      const focusable = [...sidebar.querySelectorAll('button, a, summary')].filter(element => element.getClientRects().length);
      const first = focusable[0], last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });

  async function copyText(text, button, success, normal) {
    try {
      await navigator.clipboard.writeText(text);
      button.textContent = success;
      say(success);
    } catch (_) {
      button.textContent = '请手动复制';
      say('未能自动复制，请手动选择并复制内容');
    }
    setTimeout(() => { button.textContent = normal; }, 2000);
  }
  const copyLink = document.getElementById('copy-page-link');
  if (copyLink) copyLink.addEventListener('click', () => copyText(window.location.href, copyLink.querySelector('span'), '已复制', '复制链接'));

  const article = document.getElementById('article-content');
  if (article) {
    // Keep the Tree theme's client-generated anchors for existing bookmarks.
    [...article.children].forEach((element, i) => {
      if (!/^H[1-4]$/.test(element.tagName)) return;
      const anchor = document.createElement('span');
      anchor.id = '_label' + i;
      anchor.className = 'legacy-anchor';
      element.before(anchor);
    });
    article.querySelectorAll('h1[id], h2[id], h3[id]').forEach(heading => {
      const link = document.createElement('a');
      link.className = 'heading-link';
      link.href = '#' + encodeURIComponent(heading.id);
      link.setAttribute('aria-label', '链接到' + heading.textContent);
      link.textContent = '#';
      heading.append(link);
    });
    if (window.location.hash.startsWith('#_label')) document.getElementById(window.location.hash.slice(1))?.scrollIntoView();

    article.querySelectorAll('figure.highlight').forEach(figure => {
      const lines = [...figure.querySelectorAll('.code .line')];
      const source = lines.length ? lines.map(line => line.textContent).join('\n') : figure.querySelector('.code pre')?.textContent || '';
      const language = [...figure.classList].find(name => name !== 'highlight') || '代码';
      const toolbar = document.createElement('div');
      toolbar.className = 'code-toolbar';
      const label = document.createElement('span');
      label.textContent = language === 'c++' || language === 'cpp' ? 'C++' : language;
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = '复制代码';
      button.setAttribute('aria-label', '复制' + label.textContent + '代码');
      button.addEventListener('click', () => copyText(source, button, '已复制', '复制代码'));
      toolbar.append(label, button);
      figure.prepend(toolbar);
      const table = figure.querySelector('table');
      if (table) {
        const scroll = document.createElement('div');
        scroll.className = 'code-scroll';
        scroll.tabIndex = 0;
        scroll.setAttribute('role', 'region');
        scroll.setAttribute('aria-label', label.textContent + '代码，可横向滚动');
        table.before(scroll);
        scroll.append(table);
      }
    });
    article.querySelectorAll('table').forEach(table => {
      if (table.closest('.highlight')) return;
      const wrap = document.createElement('div');
      wrap.className = 'table-scroll';
      wrap.tabIndex = 0;
      wrap.setAttribute('role', 'region');
      wrap.setAttribute('aria-label', '表格，可横向滚动');
      table.before(wrap);
      wrap.append(table);
    });
    const tocLinks = [...document.querySelectorAll('#article-toc a')];
    const headings = tocLinks.map(link => document.getElementById(decodeURIComponent(link.hash.slice(1))));
    let pendingScroll = false;
    function updateOutline() {
      let current = 0;
      headings.forEach((heading, i) => { if (heading?.getBoundingClientRect().top <= 120) current = i; });
      tocLinks.forEach((link, i) => {
        link.classList.toggle('is-current', i === current);
        if (i === current) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
      });
      pendingScroll = false;
    }
    if (tocLinks.length) {
      updateOutline();
      window.addEventListener('scroll', () => {
        if (!pendingScroll) { pendingScroll = true; requestAnimationFrame(updateOutline); }
      }, { passive: true });
    }
  }

  // Only load the local Mermaid bundle on a page that actually contains a diagram.
  const diagrams = [...document.querySelectorAll('.mermaid')].map(node => ({ node, source: node.textContent }));
  let mermaidPromise;
  let diagramTheme;
  let diagramSerial = 0;
  let renderQueue = Promise.resolve();
  function renderDiagrams() {
    if (!diagrams.length) return;
    renderQueue = renderQueue.then(async () => {
      const theme = root.dataset.theme;
      if (diagramTheme === theme) return;
      mermaidPromise ||= new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = '/vendor/mermaid/mermaid.min.js';
        script.onload = () => resolve(window.mermaid);
        script.onerror = reject;
        document.head.append(script);
      });
      const mermaid = await mermaidPromise;
      mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: theme === 'dark' ? 'dark' : 'neutral', fontFamily: 'IBM Plex Sans, sans-serif' });
      for (const { node, source } of diagrams) {
        const { svg, bindFunctions } = await mermaid.render('wiki-diagram-' + ++diagramSerial, source);
        node.innerHTML = svg;
        bindFunctions?.(node);
      }
      diagramTheme = theme;
    }).catch(() => {
      mermaidPromise = undefined;
      say('图表未能加载，请刷新页面重试');
    });
  }
  applyTheme(root.dataset.theme);
})();
