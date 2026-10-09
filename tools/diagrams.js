(function () {
  'use strict';
  // Most articles contain no diagrams. Load the renderer only when needed.
  if (!document.querySelector('.mermaid')) return;
  var script = document.createElement('script');
  script.src = '/vendor/mermaid/mermaid.min.js';
  script.onload = function () {
    mermaid.initialize({ startOnLoad: false, theme: 'forest', securityLevel: 'strict' });
    mermaid.run({ querySelector: '.mermaid' }).catch(function (error) {
      console.warn('Unable to render a diagram:', error);
    });
  };
  document.head.appendChild(script);
})();
