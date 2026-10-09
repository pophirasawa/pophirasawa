# Blog maintenance

- This is PopHirasawa's existing Hexo blog, with a separate Wiki and an existing CF Pages deployment hook.
- Use Node.js 22 and `npm ci --ignore-scripts`. `npm run build` builds both sites and runs output checks; `hexo generate` alone is insufficient.
- Articles live in `source/_posts/` and `source_wiki/_posts/`. Keep existing dates, filenames, permalinks and heading IDs unless a content change requires changing them.
- `public/` is intentionally tracked to support local compilation followed by Git push and the existing deployment hook. Regenerate it after source, theme, configuration or build-tool changes.
- Never track `node_modules/`, Hexo caches or authentication credentials. Melody is a local theme at `themes/melody/`; do not replace it with an npm-installed theme and lose fixes.
- The active Wiki theme is `themes/wiki/`, configured in `_config_wiki.yml`. `themes/tree/` is historical reference. Keep the synchronous theme bootstrap before CSS, local search, keyboard navigation, mobile drawer and both day/night palettes working. Wiki styles must not affect the blog.
- Browser JS, CSS and fonts are bundled or copied to `public/vendor/`. Update `tools/vendor.cjs` and the lockfile when changing browser dependencies; preserve package licenses.
- Keep legacy `/wiki/wiki/...` redirects working. Canonical Wiki URLs begin with one `/wiki/` prefix.
- Keep math, code highlighting, footnotes, article images, pinned posts, Wiki directory search and mobile navigation functional. For dependency or theme changes, validate representative pages in a browser as well as running the build.
- Valine comments still use an external LeanCloud API. A `pages.dev` blog URL is not a valid replacement for the comment API. See README for remaining upstream dependency audit limitations.
- For publication, include both the article sources and regenerated `public/` output. The existing CF Pages hook handles deployment after push; account authentication is configured in the environment that performs the push.
- For Wiki theme changes, preserve both Markdown heading IDs and the old Tree `_labelN` bookmarks. Search indexes must include every published note and retain canonical `/wiki/` URLs.
