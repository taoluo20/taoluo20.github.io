# Portfolio

## English

A portfolio of visual effects, procedural art, and photography.

[Visit the website](https://taoluo20.github.io/)

## 中文

视觉特效、程序化艺术与摄影作品集。

[访问网站](https://taoluo20.github.io/)

## VFX access / VFX 访问

VFX is temporarily public for grading. `vfxPasswordRequired` in `app.js` is `false`; set it to `true` only when the owner asks to restore protection. There is no automatic expiry.

VFX 暂时开放供评分。`app.js` 中的 `vfxPasswordRequired` 设为 `false`，仅在站主明确要求恢复保护时改回 `true`，不自动恢复。

When enabled, VFX pages, categories, and direct project links share a password gate. A successful unlock is remembered in the current tab using `sessionStorage`. The password verifier is the SHA-256 digest in `app.js`.

启用保护时，VFX 总页、分类页和项目直达链接共用密码入口，当前标签页解锁后刷新仍然有效。密码校验值保存在 `app.js` 的 SHA-256 摘要中。

This is a browser-side gate for a static GitHub Pages site. Source data, media files, and external embeds remain public; confidential content requires server-side authentication.

这是 GitHub Pages 静态站点的前端门禁；源码数据、媒体文件及外部嵌入资源仍然公开。保密内容需要服务端鉴权。
