# Portfolio

## English

A portfolio of visual effects, procedural art, and photography.

[Visit the website](https://taoluo20.github.io/)

## 中文

视觉特效、程序化艺术与摄影作品集。

[访问网站](https://taoluo20.github.io/)

## Homepage & Demo / 主页与 Demo

Homepage highlights and the continuous Demo reel use only the seven full videos in `vfx-data.js`. Each homepage highlight is three seconds; the two-second clean Porcelain Fracture export is included in full. Still images, journal clips, and Supernova are excluded. Demo has a three-column category layout with VFX centered, leading to a single 129.292-second movie with the original audio preserved.

The homepage plays the highlights as a muted, decorative background behind TAO LUO, without player controls, captions, or extra links. Reduced motion shows a static poster instead. The full Demo reel keeps its playback controls.

主页和 Demo 仅使用 VFX 列表中的七段正片，不使用博客片段、静帧或 Supernova。主页每段精选三秒，去掉左上角小窗的两秒花瓶片段完整保留。Demo 分类为三列布局，目前 VFX 居中，点击进入约两分九秒的连续合集，保留原音轨。

主页以静音背景自动轮播精选，画面上只保留 TAO LUO，不显示播放按钮、切换、片名、说明或额外链接。系统开启减少动态效果时改为静态封面。完整 Demo 合集保留播放器控制。

Set `FFMPEG_PATH` to an FFmpeg executable, then run `npm run reels` to regenerate the media from `reel-edit.json`. `node prepare-reels.cjs --inspect` produces contact sheets under `.preview/reel-build/`. The regular static build includes `reel-data.js` and the generated media; FFmpeg is only required when changing the edit.

## VFX access / VFX 访问

VFX is temporarily public for grading. `vfxPasswordRequired` in `app.js` is `false`; set it to `true` only when the owner asks to restore protection. There is no automatic expiry.

VFX 暂时开放供评分。`app.js` 中的 `vfxPasswordRequired` 设为 `false`，仅在站主明确要求恢复保护时改回 `true`，不自动恢复。

When enabled, VFX pages, categories, and direct project links share a password gate. A successful unlock is remembered in the current tab using `sessionStorage`. The password verifier is the SHA-256 digest in `app.js`.

启用保护时，VFX 总页、分类页和项目直达链接共用密码入口，当前标签页解锁后刷新仍然有效。密码校验值保存在 `app.js` 的 SHA-256 摘要中。

This is a browser-side gate for a static GitHub Pages site. Source data, media files, and external embeds remain public; confidential content requires server-side authentication.

这是 GitHub Pages 静态站点的前端门禁；源码数据、媒体文件及外部嵌入资源仍然公开。保密内容需要服务端鉴权。
