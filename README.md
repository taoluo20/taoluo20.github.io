# Tao Luo — Portfolio

GitHub Pages 发布专用目录。首页、DEMO、VFX、About Me、Contact 统一显示 **Work in progress**。导航、日夜切换及五个社交入口保留。Photography 展示已配对的真实照片，支持年份和地点筛选、悬停摘要及完整参数页。

首次访问、没有已保存的主题时，只读取一次浏览器的深浅色偏好并立即保存。之后打开或刷新均沿用保存的主题，不再自动跟随浏览器变化；手动切换会更新保存的选择。已有主题记录的访客继续使用原来的选择。

Blog 分为项目列表 → 项目文章网格 → 单篇文章三层，均支持黑白主题。导航下面靠右放 Personal / SCAD 分类；项目和文章网格桌面每行三张卡片。目前 SCAD 下有 **Magic Crystal Overload**，**post #001** 已发布项目动机与 NASA 超新星参考，**post #002** 保留 WIP 封面和空白正文，Personal 暂无内容。单篇文章底部为上一篇 / 返回当前项目 / 下一篇。

文章区域最大 1080px，段落最大 1000px，图片和视频默认最大 800px 居中，正文宽度独立于媒体。001 使用 NASA 官方 MP4 原生播放器，无自动播放，带本地 poster、来源链接和完整署名；still 同时用于项目及 001 封面。加速参考使用用户导出的画面，转为 H.264/AAC MP4 后本地托管，保留用户的剪辑节奏。本地预览支持 MP4 类型及分段请求，可拖动视频进度。

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
- `release: 'wip'`：开放 Blog 和 Photography，其余显示 Work in progress。
- 以后改成 `release: 'full'` 可恢复完整页面，再按一键更新发布。
- `app.js`：页面与交互；`styles.css`：全站字体和布局；`blog.css`：博客布局及黑白主题样式。
- `accents.css`：全站自上而下的蓝紫—粉色渐变强调色，覆盖圆点、斜纹、强调文字、下划线和悬停状态；SVG 图标及网站图标使用相同配色。
- `footer.css`：返回顶部箭头、Web info 面板和页脚布局；`update-site-info.cjs`：发布时自动生成网站更新日期。
- `generate-pages.cjs`：根据根目录 `index.html` 和 `site-data.js` 生成页面入口及 `404.html`，文件清单为 `generated-pages.json`。修改根模板和数据，不直接编辑生成的子目录 `index.html`。新增文章后，一键发布会自动生成对应目录。

### Photography 本地预览

`photography.js` / `photography.css` 提供三列错落图片流、0.7 秒悬停摘要、年份筛选和单张照片详情。右侧漏斗图标展开地点筛选，可与年份组合。平板两列，手机一列。单张页有上一篇 / 下一篇 / 返回；方向键切换，Esc 返回。

`photography-data.js` 从摄影目录的本地配对清单生成。当前为 22 张已匹配照片，其中 20 张有完整拍摄日期和 GPS。1283、1688 由用户确认是 2023 年，月日留空。地点使用用户确认的 Savannah、Enoshima、Kamakura、Roppongi，原始 GPS 和附近城市推断只保留在本地清单。网站数据不包含精确坐标或原片路径。

`node import-photographs.cjs` 从 `../../Photography/dlv/for_web/_catalog/photos.json` 导入已配对成片，在 `assets/images/photography/640/`、`1200/`、`2400/` 生成 WebP 和 JPEG 后备图，文件名及展示名统一为 `IMG_数字`，不带编辑或版本后缀。导入需要本机 Sharp，可通过 `SHARP_MODULE` 指定模块路径；不改写原片或交付成片。后续整理新照片时先更新配对清单，再导入。地点筛选名称包含国家，例如 Savannah, United States 和 Enoshima, Japan。

`for_web` 已配对的 Photoshop 工程复制记录在本地清单的 `files.photoshop` 中，仅供本地归档，不进入网站。1283、1688、2054 的 JPG 原片放在各自文件夹的 `original/` 子目录，避免与同名调色 JPG 冲突。

### 添加 Blog 内容

在 `site-data.js` 的 `posts` 中，一项对应一个项目入口：

- `category` 设为 `Personal` 或 `SCAD`；`image` 是封面文件名，图片放在 `assets/images/`。
- `entries` 是该项目的文章卡片，按阅读顺序排列；显示名称自动组合为项目名 + `post #001`、`post #002`，可附加文章主题，后续继续编号，系统自动连接上一篇 / 下一篇。
- 每篇文章用固定 `id`（如 `post-001`）作为链接，`image` 可单独设置封面；未设置时沿用项目封面。
- 每篇的 `blocks` 按从上到下的顺序添加：`image`、`video`、`heading`、`paragraph`；空数组 `[]` 表示暂时留空。
- `paragraph` 可用 `text` 字符串，或 `children: [{ text, href? }]` 添加真正的链接；只接受 HTTPS 或站内绝对路径，不接受 HTML。
- `image` 使用 `image`（相对 `assets/images/`）、`alt`、`width`、`height`；媒体共用 `caption`、`credit`、`sourceUrl`、`sourceLabel`。可选 `size: 'wide'` 使用完整文章宽度。
- `video` 使用 `src`（HTTPS MP4 或站内绝对路径）、`poster`（相对 `assets/images/`）、`title`、`width`、`height`，并提供 `credit` 和 `sourceUrl`。播放器使用 `controls`、`playsinline`、`preload="metadata"`，不会自动播放。
- 文章可设置 `title`，显示在文章标题、卡片和浏览器标题中。001 主题为 **Reference & Effect Breakdown**，包含 15 帧时间序列、6 个阶段的形态分析，以及用户提供的加速参考视频。
- 默认进入 SCAD，设置在 `blog.defaultCategory`。

后续往 `blocks` 添加真实项目文字和媒体即可。001 正文交接来源在项目外部的 `VFX_428/blog/post-001/`，网页仓库只保存发布所需正文与素材，不复制本地原片路径或待办元数据。

```powershell
npm.cmd run check
npm.cmd run build
```

当前根目录本身就是 Pages 的 `main / (root)` 发布来源，`.nojekyll` 禁用 Jekyll。`dist/` 是额外生成的静态输出，已从 Git 排除。字体和图标本地存放，图片来源见 `assets/asset-sources.json`。
