'use strict';

const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

function vendor() {
  const destination = path.join(root, 'public/vendor');
  fs.mkdirSync(destination, { recursive: true });
  const assets = [
    ['@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff2', 'fonts/ibm-plex-sans-400.woff2'],
    ['@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-500-normal.woff2', 'fonts/ibm-plex-sans-500.woff2'],
    ['@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-600-normal.woff2', 'fonts/ibm-plex-sans-600.woff2'],
    ['@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2', 'fonts/ibm-plex-mono-400.woff2'],
    ['jquery/dist/jquery.min.js', 'jquery/jquery.min.js'],
    ['animejs/lib/anime.min.js', 'anime/anime.min.js'],
    ['@fancyapps/fancybox/dist/jquery.fancybox.min.js', 'fancybox/jquery.fancybox.min.js'],
    ['@fancyapps/fancybox/dist/jquery.fancybox.min.css', 'fancybox/jquery.fancybox.min.css'],
    ['velocity-animate/velocity.min.js', 'velocity/velocity.min.js'],
    ['velocity-animate/velocity.ui.min.js', 'velocity/velocity.ui.min.js'],
    ['@fortawesome/fontawesome-free/css/all.min.css', 'fontawesome/css/all.min.css'],
    ['@fortawesome/fontawesome-free/css/v4-shims.min.css', 'fontawesome/css/v4-shims.min.css'],
    ['@fortawesome/fontawesome-free/webfonts', 'fontawesome/webfonts'],
    ['font-awesome/css/font-awesome.min.css', 'font-awesome/css/font-awesome.min.css'],
    ['font-awesome/fonts', 'font-awesome/fonts'],
    ['katex/dist/katex.min.css', 'katex/katex.min.css'],
    ['katex/dist/fonts', 'katex/fonts'],
    ['katex/dist/contrib/copy-tex.min.js', 'katex/copy-tex.min.js'],
    ['valine/dist/Valine.min.js', 'valine/Valine.min.js'],
    ['leancloud-storage/dist/av-min.js', 'leancloud/av-min.js'],
    ['highlight.js/styles/base16/darcula.css', 'highlight/darcula.css']
  ];
  const licenses = [];
  for (const [source, target] of assets) {
    const from = path.join(root, 'node_modules', source);
    const to = path.join(destination, target);
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.cpSync(from, to, { recursive: true });
    const packageName = source.startsWith('@') ? source.split('/').slice(0, 2).join('/') : source.split('/')[0];
    if (!licenses.includes(packageName)) licenses.push(packageName);
  }
  for (const name of licenses) {
    const packageRoot = path.join(root, 'node_modules', name);
    const info = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
    const licenseFile = fs.readdirSync(packageRoot).find(file => /^licen[cs]e(?:\.|$)/i.test(file));
    const folder = path.join(destination, 'licenses', name);
    fs.mkdirSync(folder, { recursive: true });
    fs.writeFileSync(path.join(folder, 'package.json'), JSON.stringify({name, version: info.version, license: info.license}, null, 2) + '\n');
    if (licenseFile) fs.copyFileSync(path.join(packageRoot, licenseFile), path.join(folder, licenseFile));
  }
  // Recent Mermaid releases use ESM and dynamic chunks. Bundle it for the old
  // themes so there are no further CDN imports or browser module dependencies.
  const bundled = path.join(destination, 'mermaid/mermaid.min.js');
  fs.mkdirSync(path.dirname(bundled), { recursive: true });
  require('esbuild').buildSync({
    entryPoints: [require.resolve('mermaid')],
    outfile: bundled,
    bundle: true,
    minify: true,
    format: 'iife',
    globalName: 'MermaidBundle',
    footer: { js: 'globalThis.mermaid = MermaidBundle.default;' },
    target: ['es2020'],
    legalComments: 'linked'
  });
  const mermaidRoot = path.join(root, 'node_modules/mermaid');
  fs.mkdirSync(path.join(destination, 'licenses/mermaid'), { recursive: true });
  fs.copyFileSync(path.join(mermaidRoot, 'LICENSE'), path.join(destination, 'licenses/mermaid/LICENSE'));
  fs.copyFileSync(path.join(__dirname, 'diagrams.js'), path.join(destination, 'diagrams.js'));
  console.log('Copied pinned browser resources and licenses to public/vendor.');
}

module.exports = vendor;
if (require.main === module) vendor();
