# Tao Luo — Portfolio

GitHub Pages 发布专用目录。第二版：除 Blog 及其文章外，首页、DEMO、VFX、Photography、About Me、Contact 统一显示 **Work in progress**。导航、日夜切换及五个社交入口保留。Blog 内容沿用第一版，目前仍是明确标注的示例文章。

网站目标地址：https://taoluo20.github.io/  
仓库：`taoluo20/taoluo20.github.io`

## 以后怎么更新

1. 修改这个文件夹里的网页、图片或 `site-data.js`。
2. 双击 **一键更新网站.cmd**。
3. 脚本检查文件、构建、提交并推送 `main`；GitHub Pages 随后自动更新。

没有改动时不会生成空提交。推送失败不会强制覆盖远端；本地文件和提交都会保留。

初次连接或登录失效时，双击 **首次连接GitHub.cmd**。首次连接会引导你在 GitHub 浏览器页面授权 CLI，检查当前账号为 `taoluo20`，创建公开的 Pages 仓库、推送并启用 Pages。令牌不保存在项目里。若远端仓库已有其他历史，脚本会停止而不会覆盖。

需要本机已安装 Node.js、Git 和 GitHub CLI；网站本身没有第三方运行依赖。

## 本地预览

```powershell
npm.cmd run dev
```

打开 http://127.0.0.1:5174/ 。完整第一版保存在项目上级 `versions/v1-full-preview/`，独立 ZIP 也在 `versions/`；这些备份不会进入发布仓库。

## 可编辑内容

- `site-data.js`：姓名、真实社交链接、邮箱、博客文章和作品内容。
- `release: 'wip'`：只开放 Blog，其余显示 Work in progress。
- 以后改成 `release: 'full'` 可恢复完整页面，再按一键更新发布。
- `app.js`：页面与交互；`styles.css`：字体、配色和布局。

```powershell
npm.cmd run check
npm.cmd run build
```

当前根目录本身就是 Pages 的 `main / (root)` 发布来源，`.nojekyll` 禁用 Jekyll。`dist/` 是额外生成的静态输出，已从 Git 排除。字体和图标本地存放，图片来源见 `assets/asset-sources.json`。
