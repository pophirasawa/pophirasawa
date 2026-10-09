# PopHirasawa 的博客与 Wiki

Hexo 8 + Melody 2.9（博客本地主题）+ Wiki（现代文档主题）。使用 Node.js 22；博客与 Wiki 必须一起构建。

## 安装和预览

```sh
npm ci --ignore-scripts
npm run build
npm run server
```

打开 `http://localhost:4000/` 和 `http://localhost:4000/wiki/`。修改文章后重新运行 `npm run build`，再刷新页面。预览服务器只监听本机；关闭时按 Ctrl+C。

`npm run build` 会依次清理并生成博客、清理并生成 Wiki、复制固定版本的 JS/CSS/字体、检查生成结果。任何主题或插件加载错误都会使构建失败。直接运行 `hexo g` 只会生成博客，也不会复制浏览器依赖，因此发布前使用统一命令。

`node_modules/` 和 `db.json` 不再提交；`public/` 继续提交，兼容“本地编译后 push”的现有流程。不要手改 `public/`；修改文章、配置或 `themes/` 后重建。Windows 可以运行 `deployment.bat`；Linux/macOS 可以运行 `./deployment.sh`。两者都调用 `npm run build`。

## 写文章

```sh
npm run new -- "文章标题"
npm run new:wiki -- "Wiki条目"
npm run draft -- "未完成的文章"
npm run publish -- "未完成的文章"
```

博客正文在 `source/_posts/`；Wiki 正文在 `source_wiki/_posts/`。目录会作为未指定分类的文章分类。`date` 使用上海时区，并决定博客永久地址，发表后不要随意更改日期或文件路径。未填写 `updated` 时使用文章日期，避免重新 clone 导致所有旧文变成“刚刚更新”。

支持数学公式、代码高亮、脚注、Mermaid，以及原有 `top: 1` / `top: 2` 置顶。博客启用文章资源目录，图片放在与 Markdown 同名的目录中；已有 `回文树/tree.png` 这种写法仍然可用。草稿不会进入正常构建；`publish` 会把草稿移入正式文章目录。

## 本地构建后提交

```sh
git switch master
git pull --ff-only
npm ci --ignore-scripts
npm run build
git status
git add source source_wiki public
git commit -m "发布：文章标题"
git push origin master
```

如果同时修改了配置、主题或工具，把对应文件也加入本次提交。主题、依赖等维护改动先在工作分支完成构建和验证，再合并到 `master`。CF Pages 从 `master` 自动部署，部署后到 `https://pophirasawa.top` 检查结果。

Windows 下继续使用原来的 `deployment.bat`：先安装 Node.js 22 并运行 `npm ci --ignore-scripts`，然后运行这个批处理。它现在调用 `npm run build`，会一起生成博客、Wiki 和本地浏览器资源，并检查输出；构建失败会返回失败状态。它只负责编译，编译成功后仍需要提交并推送 `public/` 和文章源码。

Linux/macOS 下安装依赖后运行 `./deployment.sh`，也可以直接运行 `npm run build`。脚本会切换到仓库目录再构建，任何步骤失败都会停止；不会自动提交或推送。新增博客文章、Wiki、清理和预览分别用上面的 `npm run new`、`npm run new:wiki`、`npm run clean` 和 `npm run server`，这些命令在两种系统上通用。

## GitHub 写入认证

公开仓库的 clone 不需要登录；push 需要认证。Git 的提交身份和 GitHub 登录是两件事。首次使用时，在本仓库设置你的提交姓名和邮箱：

```sh
git config user.name "PopHirasawa"
git config user.email "你的 GitHub 提交邮箱"
```

推荐使用 GitHub CLI 的浏览器登录（需要先安装 `gh`）：

```sh
gh auth login --hostname github.com --git-protocol https --web
gh auth setup-git
gh auth status
```

也可以使用 Git Credential Manager 或 GitHub Desktop 登录，或者配置 SSH 公钥。HTTPS 的密码位置不能填写 GitHub 账号密码，应使用凭据管理器或 token。认证应在实际执行 push 的电脑或工作环境完成；不要把 token 或 SSH 私钥放进仓库或聊天。

参考：[GitHub 命令行认证](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/about-authentication-to-github#authenticating-with-the-command-line)。

## 托管设置

当前使用你已有的 CF Pages 自动部署 hook；继续使用“本地运行 `deployment.bat` / `./deployment.sh` → 提交源码和 `public/` → push 到 `master` → hook 部署”。保留已有的静态发布设置，发布目录为 `public`，不需要改成在 Cloudflare 上编译。以下第二种方式仅用于将来主动迁移到云端构建：

| 发布方式 | 平台构建命令 | 输出目录 |
| --- | --- | --- |
| 继续使用本地已编译的 `public/` | 不运行 Hexo 构建（保留平台现有的静态发布设置） | `public` |
| 在 Cloudflare Pages 上构建源码 | `npm run build` | `public` |

Cloudflare Pages 若构建源码，生产分支为 `master`，Node.js 版本设为 `22`（`.nvmrc` 已提供，也可在控制台设置 `NODE_VERSION=22`）。官方设置说明：[Cloudflare Pages 的 Hexo 部署指南](https://developers.cloudflare.com/pages/framework-guides/deploy-a-hexo-site/)。无需填写 Hexo `deploy`；当前 `deploy.type` 为空，原先的 `npm run deploy` 实际不会发布。

GitHub Actions 只验证安装与构建；不调用部署 hook，也不改变线上托管配置。不要把 hook URL 或 Cloudflare token 写进仓库。

## 资源与维护

- Melody 主题来自仓库原先实际使用的 2.9.0，保存在 `themes/melody/` 并保留原许可；重新安装依赖不会覆盖本地修复。
- Wiki 使用 `themes/wiki/`：中性底色与 `#3935bb` 点缀的日夜主题、可折叠知识目录、文章大纲、全文搜索和代码复制。日夜主题默认跟随系统，手动选择后记住；Ctrl/⌘ K 打开本地搜索，支持标题、文件名和正文。手机使用目录抽屉。IBM Plex 字体由本站提供，未选择主题时会在 CSS 加载前读取系统偏好，避免页面闪烁。旧 Tree 源码保留作历史参考。
- 核心浏览器依赖位于生成的 `/vendor/`，由 `tools/vendor.cjs` 从 lockfile 锁定的 npm 包复制并附带许可。无需访问 jsDelivr、cdnjs、BootCDN 或 staticfile 来显示页面、公式和图表。
- Mermaid 仅在包含图表的页面加载；Wiki 图表随日夜主题重新渲染。Wiki 搜索不依赖 jQuery 或外部搜索服务，输入引号等字符不会破坏界面。
- Wiki 的规范地址是 `/wiki/条目/`，旧 `/wiki/wiki/条目/` 保留静态跳转页；分类和标签链接也指向 Wiki 自己。
- 不蒜子统计默认关闭，避免每页都请求第三方服务。Valine 和 LeanCloud SDK 已随站点提供；评论 API 和头像仍是第三方服务。原先 `severURLs` 拼错且填写了博客网址，现使用正确的 `serverURLs`，指向 LeanCloud 应用路由返回的 `https://shared.lc-cn-n1-shared.com`。2026-10-08 只读计数请求返回 HTTP 200，未读取评论正文或测试发表新评论。后续迁移 LeanCloud 时，从新应用凭证中核对 REST API 地址，不要填写博客网址。
- 把 JS/CSS 本地化只解决外部依赖访问问题，不能保证博客托管节点本身在中国大陆的速度。没有大陆网络实测数据时，不应把此修复描述成测速结论。

升级依赖后执行 `npm run build` 和 `npm audit`。2026-10-08 的干净安装审计仍有 17 项：7 moderate、9 high、1 critical，来自 Valine/LeanCloud 和 Hexo 的部分上游依赖。当前没有把审计项全部消除；Valine 的浏览器文件是上游预编译产物，单独覆盖其安装依赖不能证明浏览器组件已经修复。不要运行 `npm audit fix --force` 自动降级 Hexo 或破坏评论组件。
