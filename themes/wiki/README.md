# Wiki theme

为 PopHirasawa 的 Hexo Wiki 编写的本地主题。使用中性配色与 `#39c5bb` 点缀、知识目录、文章大纲和响应式阅读布局，不加载在线字体或外部运行时资源。

- `layout/`：首页、笔记、分类、标签和搜索弹窗。
- `scripts/helpers.js`：目录、摘要、资源版本和本地 `search.json` 索引。
- `source/css/main.css`：布局、日夜颜色、代码、公式和手机样式。
- `source/js/theme-init.js`：在 CSS 加载前应用系统主题或保存的选择。
- `source/js/main.js`：主题切换、搜索、手机目录、代码复制、文章大纲和按需 Mermaid。

日夜选择保存在 `pophirasawa.wiki.theme`，首次访问跟随系统；无法使用 localStorage 时仍可以切换。搜索支持标题、文件路径和正文，快捷键为 Ctrl/⌘ K，方向键选择，Enter 打开，Esc 关闭。

目录默认折叠，只自动展开当前文章的父文件夹；手动展开一个文件夹时，子文件夹保持各自的折叠状态。

正文使用一次短渐入，搜索弹窗、目录展开和手动日夜切换有轻量动效；系统启用“减少动态效果”时关闭动画。目录动画支持快速连点反向，内容仍由原生 `details` 控制。

保留现有文章地址、Markdown 标题 ID 和旧 Tree 主题的 `_labelN` 书签。Tree 源码仍留在 `themes/tree/` 供历史参考，当前 Wiki 使用 `_config_wiki.yml` 中的 `theme: wiki`。

IBM Plex Sans 和 Mono 由锁定版本的 npm 包复制到 `/vendor/fonts/`，许可位于 `/vendor/licenses/@fontsource/`。修改主题后，从仓库根目录运行 `./deployment.sh` / `deployment.bat`，同时生成博客、Wiki 和本地资源。
