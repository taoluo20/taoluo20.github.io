# Tao Luo — Portfolio

GitHub Pages 发布专用目录。首页、DEMO、VFX、Photography、About Me、Contact 统一显示 **Work in progress**。导航、日夜切换及五个社交入口保留。

Blog 使用固定白底画布，导航下面靠右放 Personal / SCAD 分类；桌面每行三张卡片。目前只有 SCAD 下的 **Magic Crystal Overload**，封面为纯白占位图片，Personal 暂无内容。进入后是单列长文章，底部为上一篇 / 返回 / 下一篇；暂时只有一篇，前后按钮禁用。

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
- `app.js`：页面与交互；`styles.css`：全站字体和布局；`blog.css`：白底博客样式。
- `accents.css`：全站自上而下的蓝紫—粉色渐变强调色，覆盖圆点、斜纹、强调文字、下划线和悬停状态；SVG 图标及网站图标使用相同配色。

### 添加 Blog 内容

在 `site-data.js` 的 `posts` 中，一项对应一个卡片入口：

- `category` 设为 `Personal` 或 `SCAD`；`image` 是封面文件名，图片放在 `assets/images/`。
- `entries` 按连载阅读顺序排列，系统自动连接上一篇 / 下一篇。一个入口可以有多篇连载，不会为每篇重复生成入口卡片。
- 每篇的 `blocks` 按从上到下的顺序添加：`image`、`heading`、`paragraph`。
- 默认进入 SCAD，设置在 `blog.defaultCategory`。

当前正文也是占位内容，后续替换为真实项目文字和图片即可。

```powershell
npm.cmd run check
npm.cmd run build
```

当前根目录本身就是 Pages 的 `main / (root)` 发布来源，`.nojekyll` 禁用 Jekyll。`dist/` 是额外生成的静态输出，已从 Git 排除。字体和图标本地存放，图片来源见 `assets/asset-sources.json`。
