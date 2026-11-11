(function () {
  'use strict';
  // Most articles contain no diagrams. Load the renderer only when needed.
  var diagrams = Array.from(document.querySelectorAll('.mermaid'));
  if (!diagrams.length) return;
  var sources = diagrams.map(function (node) { return node.textContent; });
  var script = document.createElement('script');
  script.src = '/vendor/mermaid/mermaid.min.js';
  script.onload = function () {
    var rendering = false;
    var pending = false;
    async function render() {
      if (rendering) { pending = true; return; }
      rendering = true;
      try {
        do {
          pending = false;
          var dark = document.documentElement.dataset.theme === 'dark';
          mermaid.initialize({ startOnLoad: false, theme: dark ? 'dark' : 'forest', securityLevel: 'strict' });
          diagrams.forEach(function (node, index) {
            node.removeAttribute('data-processed');
            node.textContent = sources[index];
          });
          await mermaid.run({ nodes: diagrams });
        } while (pending);
      } catch (error) {
        console.warn('Unable to render a diagram:', error);
      } finally { rendering = false; }
    }
    new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    render();
  };
  document.head.appendChild(script);
})();
