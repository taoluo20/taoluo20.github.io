# Tao Luo — Portfolio

GitHub Pages 发布专用目录。首页、DEMO、VFX、Photography、About Me、Contact 统一显示 **Work in progress**。导航、日夜切换及五个社交入口保留。

首次访问、没有已保存的主题时，只读取一次浏览器的深浅色偏好并立即保存。之后打开或刷新均沿用保存的主题，不再自动跟随浏览器变化；手动切换会更新保存的选择。已有主题记录的访客继续使用原来的选择。

Blog 分为项目列表 → 项目文章网格 → 单篇文章三层，均支持黑白主题。导航下面靠右放 Personal / SCAD 分类；项目和文章网格桌面每行三张卡片。目前 SCAD 下有 **Magic Crystal Overload**，里面有两张白底 WIP 封面的空白文章卡片，自动编号为 **post #001** 和 **post #002**，Personal 暂无内容。单篇文章底部为上一篇 / 返回当前项目 / 下一篇。

Back to top 位于页脚上方右侧，使用随黑白主题变化的弯折渐变箭头。页脚右下角的 Web info 打开网站信息面板，显示作者、网址、方向、托管方式、技术及更新时间。`site-info.json` 的更新时间由发布脚本自动写入（UTC）。没有文件改动时不修改日期，`-CheckOnly` 也不会修改日期。

网站目标地址：https://taoluo20.github.io/  
仓库：`taoluo20/taoluo20.github.io`

网站使用普通路径，例如 `/blog/`、`/blog/magic-crystal-overload/`、`/blog/magic-crystal-overload/post-001/`。站内切换使用浏览器 History API；每个路径也有真实的 `index.html` 入口，可直接打开和刷新。旧的 `#/…` 链接会自动替换为新地址，`introduction` 旧文章入口会转到 `post-001`。

## 以后怎么更新

1. 修改这个文件夹里的网页、图片或 `site-data.js`。
2. 双击 **一键更新网站.cmd**。
3. 脚本生成各页面入口、检查文件、构建、提交并推送 `main`；GitHub Pages 随后自动更新。

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
- `app.js`：页面与交互；`styles.css`：全站字体和布局；`blog.css`：博客布局及黑白主题样式。
- `accents.css`：全站自上而下的蓝紫—粉色渐变强调色，覆盖圆点、斜纹、强调文字、下划线和悬停状态；SVG 图标及网站图标使用相同配色。
- `footer.css`：返回顶部箭头、Web info 面板和页脚布局；`update-site-info.cjs`：发布时自动生成网站更新日期。
- `generate-pages.cjs`：根据根目录 `index.html` 和 `site-data.js` 生成页面入口及 `404.html`，文件清单为 `generated-pages.json`。修改根模板和数据，不直接编辑生成的子目录 `index.html`。新增文章后，一键发布会自动生成对应目录。

### 添加 Blog 内容

在 `site-data.js` 的 `posts` 中，一项对应一个项目入口：

- `category` 设为 `Personal` 或 `SCAD`；`image` 是封面文件名，图片放在 `assets/images/`。
- `entries` 是该项目的文章卡片，按阅读顺序排列；显示名称自动组合为项目名 + `post #001`、`post #002`，后续继续编号，系统自动连接上一篇 / 下一篇。
- 每篇文章用固定 `id`（如 `post-001`）作为链接，`image` 可单独设置封面；未设置时沿用项目封面。
- 每篇的 `blocks` 按从上到下的顺序添加：`image`、`heading`、`paragraph`；空数组 `[]` 表示暂时留空。
- 默认进入 SCAD，设置在 `blog.defaultCategory`。

目前两篇正文留空，后续往 `blocks` 添加真实项目文字和图片即可。

```powershell
npm.cmd run check
npm.cmd run build
```

当前根目录本身就是 Pages 的 `main / (root)` 发布来源，`.nojekyll` 禁用 Jekyll。`dist/` 是额外生成的静态输出，已从 Git 排除。字体和图标本地存放，图片来源见 `assets/asset-sources.json`。
