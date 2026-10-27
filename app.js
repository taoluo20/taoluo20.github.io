(() => {
  'use strict';
  const data = window.PORTFOLIO;
  const main = document.querySelector('#main');
  const footer = document.querySelector('#site-footer');
  const overlay = document.querySelector('#project-overlay');
  const overlayScroll = overlay.querySelector('.overlay-scroll');
  const photoOverlay = document.querySelector('#photo-overlay');
  const webInfoDialog = document.querySelector('#web-info-dialog');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg>';
  const backArrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5m7-7-7 7 7 7"/></svg>';
  const eye = '<span class="slash-mark" aria-hidden="true"></span>';
  let renderedRoute = '';
  let activeFilter = 'all';
  let photoFilter = 'all';
  let activePhoto = 0;
  let visiblePhotos = [];
  let overlayState = null;
  let closing = false;
  let toastTimeout;
  const hoverTimers = new Map();
  let siteInfoPromise;
  const asset = filename => `assets/images/${filename}`;
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const tags = project => `<div class="project-tags">${project.tags.map(tag => `<span class="project-tag">${escape(tag)}</span>`).join('')}</div>`;
  const eyebrow = text => `<p class="eyebrow">${eye}${text}</p>`;
  const getRoute = () => location.hash.replace(/^#/, '') || '/';
  const getProject = id => data.projects.find(project => project.id === id);

  function socialLinks(className = 'social-links') {
    return `<div class="${className}">${data.socials.map(social => {
      const url = social.id === 'gmail' && data.email ? `mailto:${data.email}` : social.url;
      return `<a class="social-link" href="${escape(url || '#/contact')}" ${url && !url.startsWith('mailto:') ? 'target="_blank" rel="noopener noreferrer"' : ''} ${url ? '' : `data-placeholder="${social.name}"`} aria-label="${social.name}${url ? '' : ' — link coming soon'}" title="${social.name}${url ? '' : ' · Coming soon'}"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="assets/social-icons.svg#${social.id}"/></svg></a>`;
    }).join('')}</div>`;
  }

  function renderFooter() {
    footer.innerHTML = `${socialLinks()}<div class="footer-meta"><span class="footer-note">© ${new Date().getFullYear()} TAO LUO</span><span class="footer-note">VFX · PROCEDURAL ART · PHOTOGRAPHY</span><button class="web-info-trigger meta" data-web-info aria-haspopup="dialog" aria-controls="web-info-dialog">WEB INFO <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/></svg></button></div>`;
  }

  function returnToTop() {
    return `<div class="page-end"><button class="back-top-control" data-back-top aria-label="Back to top"><svg class="back-top-art" viewBox="0 0 112 140" aria-hidden="true"><defs><linearGradient id="back-top-gradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--back-top-start)"/><stop offset=".55" style="stop-color:var(--back-top-middle)"/><stop offset="1" style="stop-color:var(--back-top-end)"/></linearGradient></defs><path d="M15 121h24c27 0 49-22 49-49V17m-15 16 15-16 15 16"/></svg><span class="back-top-label meta">BACK TO TOP</span></button></div>`;
  }

  async function showWebInfo() {
    if (!webInfoDialog.open) {
      webInfoDialog.showModal();
      document.body.classList.add('modal-open');
    }
    webInfoDialog.querySelector('#web-info-status').textContent = data.release === 'wip' ? 'Work in progress' : 'Live';
    try {
      siteInfoPromise ||= fetch('site-info.json', { cache: 'no-store' }).then(response => {
        if (!response.ok) throw new Error('Site information unavailable');
        return response.json();
      });
      const info = await siteInfoPromise;
      const updated = new Date(info.updatedAt);
      if (Number.isNaN(updated.getTime())) throw new Error('Invalid update date');
      webInfoDialog.querySelector('#web-info-version').textContent = info.version;
      const time = webInfoDialog.querySelector('#web-info-updated');
      time.dateTime = info.updatedAt;
      time.textContent = `${new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'UTC' }).format(updated)} UTC`;
    } catch {
      siteInfoPromise = null;
      webInfoDialog.querySelector('#web-info-version').textContent = 'Unavailable';
      webInfoDialog.querySelector('#web-info-updated').textContent = 'Unavailable';
    }
  }

  function card(project, index, mode = 'page') {
    return `<article class="work-card" data-card="${project.id}">
      <a class="card-link" href="#/vfx/${project.id}" data-project="${project.id}" data-mode="${mode}" aria-label="View ${escape(project.title)} project">
        <div class="card-art"><div class="card-surface">
          <img class="card-image" src="${asset(project.image)}" alt="${escape(project.summary)}" loading="lazy" width="1600" height="1067" />
          <span class="card-corner" aria-hidden="true">${arrow}<svg class="hover-progress" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18"/></svg></span>
          <div class="card-details"><p>${escape(project.summary)}</p>${tags(project)}</div>
        </div></div>
        <div class="card-meta"><span class="card-title">${escape(project.title)}</span><span class="card-type meta">${escape(project.type)}</span></div>
      </a>
    </article>`;
  }

  function homePage() {
    return `<section class="hero" aria-labelledby="hero-title">
      <div class="hero-image" aria-hidden="true"><img src="${asset('landscape.jpg')}" alt="" fetchpriority="high" width="1600" height="1063" /></div>
      <div class="hero-topline meta"><span>ART, IN EVERY FORM.</span><span>VISUAL EFFECTS<br>PROCEDURAL EXPLORATIONS</span></div>
      <div class="hero-copy">${eyebrow('VISUAL EFFECTS & PROCEDURAL ART')}
        <h1 class="hero-name" id="hero-title"><span>TAO</span><span class="outlined">LUO</span></h1>
        <div class="hero-bottom"><p class="hero-description">Simulated worlds. Observed moments.<br>A collection of things I make and see.</p><a class="hero-link text-link" href="#selected-work" data-scroll-work>EXPLORE THE WORK</a></div>
      </div>
    </section>
    <section class="section-shell" id="selected-work" aria-labelledby="selected-heading">
      <div class="section-header"><div>${eyebrow('A FEW WORLDS IN THE MAKING')}<h2 class="section-heading" id="selected-heading">Selected work</h2></div><p class="section-aside">An ongoing collection of effects,<br>environments, and experiments.</p></div>
      <div class="work-grid">${data.projects.map((project, index) => card(project, index, 'overlay')).join('')}</div>
      <div class="section-bottom"><a class="text-link" href="#/vfx">ALL VFX PROJECTS ${arrow}</a><span class="preview-caption meta">FIRST LOOK · REFERENCE IMAGERY</span></div>
    </section>
    <section class="home-contact">${eyebrow('SOMETHING IN MIND?')}<a class="contact-callout" href="#/contact"><span>Let’s talk.</span><span class="callout-arrow">${arrow}</span></a></section>`;
  }

  function workInProgressPage(section = '') {
    const label = { demo: 'DEMO', vfx: 'VFX', photography: 'PHOTOGRAPHY', about: 'ABOUT ME', contact: 'CONTACT' }[section] || 'TAO LUO / PORTFOLIO';
    return `<section class="wip-page" aria-labelledby="wip-title"><div class="wip-copy">${eyebrow(label)}<h1 class="wip-heading" id="wip-title">Work in <span>progress<span class="wip-period">.</span></span></h1><p class="wip-note">A few things are taking shape. Check back soon.</p><a class="text-link wip-blog-link" href="#/blog">VISIT THE BLOG ${arrow}</a></div><span class="wip-bottom meta">TAO LUO — VISUAL EFFECTS & PROCEDURAL ART</span></section>`;
  }

  function vfxPage() {
    const filtered = data.projects.filter(project => activeFilter === 'all' || project.category === activeFilter);
    const filters = [['all', 'All work'], ['simulation', 'FX & simulation'], ['procedural', 'Procedural'], ['lookdev', 'Look development']];
    return `<section class="page-shell"><div class="page-intro">${eyebrow('SELECTED PROJECTS')}<div class="page-topline"><h1 class="page-heading">VFX & beyond.</h1><span class="meta preview-caption">${String(data.projects.length).padStart(2, '0')} PROJECTS</span></div><p class="page-subtitle">Effects, environments, and the systems behind them.<br>A closer look at the work, from first idea to final frame.</p></div>
      <div class="filter-bar" aria-label="Filter projects">${filters.map(([value, label]) => `<button class="filter-button" data-filter="${value}" aria-pressed="${activeFilter === value}">${label}</button>`).join('')}<span class="filter-status meta">${filtered.length} PROJECTS</span></div>
      <div class="work-grid" id="vfx-grid">${filtered.map((project, index) => card(project, index)).join('')}</div>
      <div class="section-bottom"><span class="preview-caption meta">FIRST LOOK · PROJECTS & IMAGERY ARE PLACEHOLDERS</span><a class="text-link" href="#/contact">GET IN TOUCH ${arrow}</a></div>
    </section>`;
  }

  function projectPage(project, isOverlay = false) {
    const next = data.projects[(data.projects.indexOf(project) + 1) % data.projects.length];
    return `<article class="project-page" data-project-content="${project.id}">
      ${isOverlay ? '' : `<a class="project-back meta" href="#/vfx">${backArrow} ALL VFX PROJECTS</a>`}
      <div class="project-cover"><img src="${asset(project.image)}" alt="${escape(project.summary)}" width="1600" height="1067" /><div class="project-cover-copy">${eyebrow(escape(project.type))}<h1 class="${project.title.length > 8 ? 'long-title' : project.title.length > 6 ? 'medium-title' : ''}">${escape(project.title)}</h1><p class="project-cover-type meta">A VISUAL STUDY · FIRST-LOOK PROJECT</p></div></div>
      <div class="project-content"><div class="project-overview"><div class="project-introduction"><h2>${escape(project.summary)}</h2><p>${escape(project.description)}</p></div><dl class="project-info"><div><dt class="meta">DISCIPLINE</dt><dd>${escape(project.type)}</dd></div><div><dt class="meta">FOCUS</dt><dd>${escape(project.focus)}</dd></div><div><dt class="meta">STATUS</dt><dd>Layout study</dd></div><div><dt class="meta">TOOLKIT</dt><dd>${tags(project)}</dd></div></dl></div>
      <figure class="project-process-image"><img src="${asset(project.secondary)}" alt="Reference image for ${escape(project.title)}" loading="lazy" /><figcaption class="meta"><span>VISUAL REFERENCES / PROCESS</span><span>PLACEHOLDER IMAGERY</span></figcaption></figure>
      <div class="breakdown-grid"><div>${eyebrow('THE IDEA')}<h3>Finding the feeling.</h3><p>A space for the references and creative decisions behind the shot. The final project can bring together composition studies, motion tests, and the overall visual direction.</p></div><div>${eyebrow('THE PROCESS')}<h3>From a system to a scene.</h3><p>Breakdown videos, working passes, and close-up details will live here. This layout keeps the finished image in focus while leaving room for the thinking behind it.</p></div></div>
      <div class="project-next"><a href="#/vfx/${next.id}" ${isOverlay ? `data-overlay-next="${next.id}"` : ''}><span class="meta">NEXT PROJECT</span><div class="next-project-title">${escape(next.title)} ↗</div></a><a class="text-link" href="#/vfx" ${isOverlay ? 'data-overlay-all' : ''}>ALL PROJECTS ${arrow}</a></div></div>
    </article>`;
  }

  function demoPage() {
    const reelContent = data.reel
      ? `<iframe src="${escape(data.reel)}" title="Tao Luo demo reel" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`
      : `<img src="${asset('ocean.jpg')}" alt="Ocean reference photograph" /><div class="demo-center"><span class="reel-play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m8 4 13 8-13 8Z"/></svg></span><span class="meta">TAO LUO / DEMO REEL</span><h2>Moving worlds.</h2><p>The reel is on its way.</p><a class="text-link" href="#/vfx">EXPLORE THE PROJECTS ${arrow}</a></div>`;
    return `<section class="page-shell" style="padding-bottom:0"><div class="page-intro">${eyebrow('A COLLECTION IN MOTION')}<h1 class="page-heading">Demo reel.</h1><p class="page-subtitle">A little of everything, in motion.</p></div></section><section class="demo-layout"><div class="demo-frame">${reelContent}</div><div class="demo-meta"><span class="meta">VISUAL EFFECTS / PROCEDURAL ART</span><span class="meta">${data.reel ? 'TAO LUO' : 'REEL PLACEHOLDER · VIDEO TO FOLLOW'}</span></div></section>`;
  }

  function photographyPage() {
    visiblePhotos = data.photographs.filter(photo => photoFilter === 'all' || photo.category.toLowerCase() === photoFilter);
    return `<section class="page-shell"><div class="page-intro">${eyebrow('AWAY FROM THE VIEWPORT')}<h1 class="page-heading">A different lens.</h1><p class="page-subtitle">Light, places, and the things in between.<br>A collection of moments worth keeping.</p></div><div class="filter-bar" aria-label="Filter photographs">${[['all','All photographs'],['nature','Nature'],['street','Street'],['architecture','Architecture']].map(([value,label]) => `<button class="filter-button" data-photo-filter="${value}" aria-pressed="${photoFilter === value}">${label}</button>`).join('')}</div><div class="photography-grid">${visiblePhotos.map((photo, index) => `<button class="photo-card" data-photo="${index}" aria-label="Open ${escape(photo.title)}"><figure><img src="${asset(photo.image)}" alt="${escape(photo.alt)}" loading="lazy" /><figcaption><span class="photo-title">${escape(photo.title)}</span><span class="meta">${escape(photo.category)}</span></figcaption></figure></button>`).join('')}</div><div class="section-bottom"><span class="preview-caption meta">REFERENCE PHOTOGRAPHY · PERSONAL IMAGES TO FOLLOW</span></div></section>`;
  }

  function aboutPage() {
    return `<section class="page-shell"><div class="page-intro">${eyebrow('THE PERSON BEHIND THE PIXELS')}<h1 class="page-heading">A little about me.</h1></div><div class="about-layout"><div class="about-image"><img src="${asset('forest.jpg')}" alt="Light in a forest — temporary image" /><span class="meta">A PLACE FOR A PORTRAIT, OR A PLACE THAT FEELS LIKE YOU.</span></div><div class="about-copy"><h2>Hi, I’m Tao.<br>I like making worlds.</h2><p>Visual effects, procedural art, and photography — different ways of looking a little closer.</p><p>This space will hold my story: the work I care about, the ideas I keep coming back to, and what I’m looking to create next.</p><div class="about-disciplines"><div class="discipline"><span>Visual effects</span><span class="meta">MOTION & SIMULATION</span></div><div class="discipline"><span>Procedural art</span><span class="meta">SYSTEMS & ENVIRONMENTS</span></div><div class="discipline"><span>Photography</span><span class="meta">LIGHT & OBSERVATION</span></div></div><a class="text-link" href="#/contact">LET’S MAKE SOMETHING ${arrow}</a><p class="about-note">First-look biography · more to come.</p></div></div></section>`;
  }

  function blogCategory(value) {
    const category = String(value || data.blog?.defaultCategory || 'scad').toLowerCase();
    return category === 'personal' ? 'personal' : 'scad';
  }

  function blogNavigation(category) {
    return `<nav class="blog-subnav" aria-label="Blog categories"><span class="blog-subnav-label meta">JOURNAL</span><div class="blog-category-links">${['personal', 'scad'].map(key => `<a href="#/blog?category=${key}" ${category === key ? 'aria-current="page"' : ''}>${key === 'scad' ? 'SCAD' : 'Personal'}</a>`).join('')}</div></nav>`;
  }

  function blogPage(category) {
    const posts = data.posts.filter(post => blogCategory(post.category) === category);
    return `${blogNavigation(category)}<section class="journal-index"><header class="journal-index-heading"><div><span class="journal-kicker meta">A WORKING COLLECTION</span><h1>Blog<span>.</span></h1></div><p>Notes, experiments,<br>and things in the making.</p></header>${posts.length ? `<div class="blog-grid journal-grid">${posts.map(post => `<a class="journal-card" href="#/blog/${escape(post.id)}" aria-label="Read ${escape(post.title)}"><div class="journal-card-image"><img src="${asset(post.image)}" alt="${escape(post.title)} — white cover placeholder" width="1600" height="1000" /></div><div class="journal-card-copy"><div class="journal-card-meta meta"><span>${escape(post.category)}</span><span class="journal-card-arrow" aria-hidden="true">${arrow}</span></div><h2>${escape(post.title)}</h2><p>${escape(post.excerpt)}</p></div></a>`).join('')}</div>` : `<div class="journal-empty"><span class="meta">PERSONAL</span><p>A little more to come.</p><span>Work in progress.</span></div>`}</section>`;
  }

  function articlePage(post, entry) {
    const category = blogCategory(post.category);
    const entryIndex = post.entries.indexOf(entry);
    const previous = post.entries[entryIndex - 1];
    const next = post.entries[entryIndex + 1];
    const entryUrl = target => `#/blog/${post.id}/${target.id}`;
    const step = (target, direction) => target
      ? `<a class="journal-step journal-step-${direction}" href="${entryUrl(target)}" rel="${direction === 'previous' ? 'prev' : 'next'}"><span class="journal-step-label">${direction === 'previous' ? backArrow : arrow}<span>${direction === 'previous' ? 'Previous entry' : 'Next entry'}</span></span><span class="journal-step-title">${escape(target.title)}</span></a>`
      : `<button class="journal-step journal-step-${direction}" type="button" disabled><span class="journal-step-label">${direction === 'previous' ? backArrow : arrow}<span>${direction === 'previous' ? 'Previous entry' : 'Next entry'}</span></span><span class="journal-step-title">${direction === 'previous' ? 'You’re at the beginning' : 'More to come'}</span></button>`;
    const blocks = entry.blocks.map(block => {
      if (block.type === 'image') return `<figure class="journal-figure"><img src="${asset(block.image)}" alt="${escape(block.alt || '')}" width="1600" height="1000" />${block.caption ? `<figcaption>${escape(block.caption)}</figcaption>` : ''}</figure>`;
      if (block.type === 'heading') return `<h2>${escape(block.text)}</h2>`;
      return `<p>${escape(block.text)}</p>`;
    }).join('');
    return `${blogNavigation(category)}<section class="journal-reading"><article class="journal-article"><header class="journal-article-heading"><a class="journal-breadcrumb meta" href="#/blog?category=${category}">${backArrow} ${escape(post.category)} / ${escape(post.title)}</a><h1>${escape(entry.title)}</h1><div class="journal-byline"><span><span class="brand-dot" aria-hidden="true"></span>Tao Luo</span><span class="meta">PROJECT JOURNAL</span></div></header><div class="journal-body">${blocks}</div><nav class="journal-pagination" aria-label="Journal entries">${step(previous, 'previous')}<a class="journal-return" href="#/blog?category=${category}"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><rect x="14" y="14" width="6" height="6"/></svg><span>Back</span></a>${step(next, 'next')}</nav></article></section>`;
  }

  function contactPage() {
    return `<section class="page-shell contact-page"><div class="contact-layout"><div class="contact-copy">${eyebrow('SAY HELLO')}<h1>Let’s talk.</h1><p>Have a project in mind, a question, or just want to say hello?<br>I’d love to hear from you.</p><div class="contact-detail"><span class="meta">EMAIL</span>${data.email ? `<a href="mailto:${escape(data.email)}">${escape(data.email)}</a>` : '<span>Email coming soon</span>'}</div><div class="contact-detail"><span class="meta">ELSEWHERE</span><div class="contact-inline-socials">${data.socials.filter(s => ['artstation','linkedin','instagram'].includes(s.id)).map(s => `<a href="${escape(s.url || '#/contact')}" ${s.url ? 'target="_blank" rel="noopener noreferrer"' : `data-placeholder="${s.name}"`}>${s.name} ${arrow}</a>`).join('')}</div></div></div><form class="contact-form" id="contact-form"><div class="form-row"><div class="field"><label for="contact-name">NAME <span>*</span></label><input id="contact-name" name="name" autocomplete="name" placeholder="Your name" required maxlength="120" /></div><div class="field"><label for="contact-email">EMAIL <span>*</span></label><input id="contact-email" name="email" type="email" autocomplete="email" placeholder="you@example.com" required maxlength="254" /></div></div><div class="field"><label for="contact-subject">SUBJECT</label><input id="contact-subject" name="subject" placeholder="What’s on your mind?" maxlength="200" /></div><div class="field"><label for="contact-message">MESSAGE <span>*</span></label><textarea id="contact-message" name="message" placeholder="Tell me a little about it…" required maxlength="8000"></textarea></div><div class="form-bottom"><button class="send-button" type="submit">SEND MESSAGE ${arrow}</button><span class="contact-note">${data.email ? 'OPENS YOUR EMAIL APP' : 'PREVIEW FORM · EMAIL TO FOLLOW'}</span></div><p id="form-status" class="form-status" role="status" aria-live="polite"></p></form></div></section>`;
  }

  function setNavigation(section) {
    document.querySelectorAll('[data-nav]').forEach(link => {
      if (link.dataset.nav === section) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    const menu = document.querySelector('#primary-nav');
    menu.classList.remove('is-open');
    document.querySelector('.mobile-menu-toggle').setAttribute('aria-expanded', 'false');
  }

  function resetHover() {
    hoverTimers.forEach(timer => clearTimeout(timer));
    hoverTimers.clear();
    document.querySelectorAll('.work-card.is-expanded,.work-card.is-waiting').forEach(card => card.classList.remove('is-expanded', 'is-waiting'));
  }

  function bindCardHover() {
    if (!window.matchMedia('(hover: hover)').matches) return;
    main.querySelectorAll('.work-card').forEach(card => {
      card.addEventListener('pointerenter', event => {
        if (event.pointerType === 'touch') return;
        const current = hoverTimers.get(card);
        if (current) clearTimeout(current);
        card.classList.add('is-waiting');
        hoverTimers.set(card, setTimeout(() => {
          card.classList.remove('is-waiting');
          card.classList.add('is-expanded');
          hoverTimers.delete(card);
        }, 2000));
      });
      card.addEventListener('pointerleave', () => {
        clearTimeout(hoverTimers.get(card));
        hoverTimers.delete(card);
        card.classList.remove('is-waiting', 'is-expanded');
      });
    });
  }

  function renderRoute(route = getRoute(), { preserveScroll = false } = {}) {
    if (webInfoDialog.open) webInfoDialog.close();
    if (photoOverlay.open) photoOverlay.close();
    resetHover();
    const routeUrl = new URL(route, 'https://portfolio.local');
    const [section = '', id, entryId] = routeUrl.pathname.split('/').filter(Boolean);
    main.classList.toggle('blog-main', section === 'blog');
    let title = '';
    let content;
    if (data.release === 'wip' && section !== 'blog') {
      content = workInProgressPage(section);
      title = section ? ({ demo: 'Demo', vfx: 'VFX', photography: 'Photography', about: 'About me', contact: 'Contact' }[section] || 'Work in progress') : 'Work in progress';
    } else if (section === 'vfx' && id) {
      const project = getProject(id);
      content = project ? projectPage(project) : null;
      title = project?.title;
    } else if (section === 'blog' && id) {
      const post = data.posts.find(post => post.id === id);
      const entry = post?.entries.find(item => !entryId || item.id === entryId);
      content = post && entry ? articlePage(post, entry) : null;
      title = entry?.title;
    } else {
      const pages = { demo: demoPage, vfx: vfxPage, photography: photographyPage, about: aboutPage, blog: () => blogPage(blogCategory(routeUrl.searchParams.get('category'))), contact: contactPage };
      content = pages[section] ? pages[section]() : section ? null : homePage();
      title = { demo: 'Demo reel', vfx: 'VFX', photography: 'Photography', about: 'About me', blog: 'Blog', contact: 'Contact' }[section] || '';
    }
    if (!content) {
      content = `<section class="page-shell">${eyebrow('A SMALL DETOUR')}<h1 class="page-heading">Not here.</h1><p class="page-subtitle">This page couldn’t be found.</p><p><a class="text-link" href="#/">BACK HOME ${arrow}</a></p></section>`;
      title = 'Page not found';
    }
    main.innerHTML = content + returnToTop();
    renderedRoute = route;
    document.title = `${title ? title + ' — ' : ''}Tao Luo — Visual Artist`;
    setNavigation(section);
    bindCardHover();
    if (!preserveScroll) window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function toast(message) {
    const element = document.querySelector('#toast');
    clearTimeout(toastTimeout);
    element.textContent = message;
    element.classList.add('visible');
    toastTimeout = setTimeout(() => element.classList.remove('visible'), 3400);
  }

  function makeTransition(image, from, to, reverse = false) {
    if (!image || reducedMotion.matches || !from || !to) return Promise.resolve();
    const clone = document.createElement('img');
    clone.className = 'transition-image';
    clone.src = image.currentSrc || image.src;
    clone.alt = '';
    const host = overlay.open ? overlay : document.body;
    host.appendChild(clone);
    const dimensions = (rect, radius) => ({ left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px`, borderRadius: radius });
    const anim = clone.animate([dimensions(from, reverse ? '0px' : '16px'), dimensions(to, reverse ? '16px' : '0px')], { duration: 650, easing: 'cubic-bezier(.23,.8,.18,1)', fill: 'both' });
    return anim.finished.catch(() => {}).then(() => clone.remove());
  }

  async function openProject(id, sourceCard, { fromHistory = false } = {}) {
    if (overlay.open || closing) return;
    const project = getProject(id);
    if (!project) return;
    const sourceSurface = sourceCard?.querySelector('.card-surface');
    const sourceImage = sourceSurface?.querySelector('img');
    const origin = sourceSurface?.getBoundingClientRect();
    overlayState = { id, sourceCard, backgroundRoute: renderedRoute, scrollY: window.scrollY };
    if (!fromHistory) history.pushState({ overlayProject: id, backgroundRoute: renderedRoute, scrollY: window.scrollY }, '', `#/vfx/${id}`);
    overlayScroll.innerHTML = projectPage(project, true);
    overlay.classList.add('is-entering');
    overlay.showModal();
    overlayScroll.scrollTop = 0;
    document.body.classList.add('modal-open');
    const target = overlay.querySelector('.project-cover').getBoundingClientRect();
    sourceSurface?.classList.add('source-hidden');
    await makeTransition(sourceImage, origin, target);
    overlay.classList.remove('is-entering');
    overlay.querySelector('.overlay-close').focus({ preventScroll: true });
    document.title = `${project.title} — Tao Luo`;
  }

  async function finishClose() {
    if (!overlay.open || closing) return;
    closing = true;
    const previous = overlayState;
    const sourceSurface = previous?.sourceCard?.querySelector('.card-surface');
    const sourceRect = sourceSurface?.getBoundingClientRect();
    const image = overlay.querySelector('.project-cover>img');
    const coverRect = overlay.querySelector('.project-cover')?.getBoundingClientRect();
    const from = coverRect && coverRect.bottom > 0 ? coverRect : { top: 0, left: 0, width: innerWidth, height: innerHeight };
    overlay.classList.add('is-closing');
    if (sourceRect && sourceRect.bottom > 0 && sourceRect.top < innerHeight) await makeTransition(image, from, sourceRect, true);
    overlay.close();
    overlay.classList.remove('is-entering', 'is-closing');
    document.body.classList.remove('modal-open');
    sourceSurface?.classList.remove('source-hidden');
    previous?.sourceCard?.classList.remove('is-expanded', 'is-waiting');
    overlayScroll.innerHTML = '';
    overlayState = null;
    closing = false;
    if (previous && getRoute() === previous.backgroundRoute) {
      window.scrollTo({ top: previous.scrollY, behavior: 'instant' });
      previous.sourceCard?.querySelector('a')?.focus({ preventScroll: true });
      document.title = 'Tao Luo — Visual Artist';
    } else renderRoute();
  }

  function requestClose() {
    if (!overlay.open || closing) return;
    if (history.state?.overlayProject) history.back();
    else {
      history.replaceState(null, '', `#${overlayState?.backgroundRoute || '/'}`);
      finishClose();
    }
  }

  function showPhoto(index) {
    activePhoto = (index + visiblePhotos.length) % visiblePhotos.length;
    const photo = visiblePhotos[activePhoto];
    if (!photo) return;
    const img = photoOverlay.querySelector('figure img');
    img.src = asset(photo.image);
    img.alt = photo.alt;
    photoOverlay.querySelector('figcaption').className = 'photo-caption';
    photoOverlay.querySelector('figcaption').textContent = `${photo.title} / ${photo.category} — ${activePhoto + 1} of ${visiblePhotos.length}`;
    if (!photoOverlay.open) { photoOverlay.showModal(); document.body.classList.add('modal-open'); }
  }

  document.addEventListener('click', event => {
    const skipLink = event.target.closest('.skip-link');
    if (skipLink) { event.preventDefault(); main.focus(); return; }
    const placeholder = event.target.closest('[data-placeholder]');
    if (placeholder) { event.preventDefault(); toast(`${placeholder.dataset.placeholder} — Tao’s link will be added soon.`); return; }
    const backTop = event.target.closest('[data-back-top]');
    if (backTop) { event.preventDefault(); main.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'instant' : 'smooth' }); return; }
    if (event.target.closest('[data-web-info]')) { showWebInfo(); return; }
    if (event.target.closest('[data-scroll-work]')) { event.preventDefault(); document.querySelector('#selected-work')?.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth' }); return; }
    const projectLink = event.target.closest('[data-project]');
    if (projectLink && projectLink.dataset.mode === 'overlay' && !event.metaKey && !event.ctrlKey && !event.shiftKey && event.button === 0) {
      event.preventDefault();
      openProject(projectLink.dataset.project, projectLink.closest('.work-card'));
      return;
    }
    const filter = event.target.closest('[data-filter]');
    if (filter) {
      activeFilter = filter.dataset.filter;
      const y = window.scrollY;
      renderRoute('/vfx', { preserveScroll: true });
      window.scrollTo({ top: y, behavior: 'instant' });
      main.querySelector(`[data-filter="${activeFilter}"]`)?.focus({ preventScroll: true });
      return;
    }
    const photographyFilter = event.target.closest('[data-photo-filter]');
    if (photographyFilter) {
      photoFilter = photographyFilter.dataset.photoFilter;
      renderRoute('/photography', { preserveScroll: true });
      main.querySelector(`[data-photo-filter="${photoFilter}"]`)?.focus({ preventScroll: true });
      return;
    }
    const photo = event.target.closest('[data-photo]');
    if (photo) showPhoto(Number(photo.dataset.photo));
  });

  document.addEventListener('submit', event => {
    if (event.target.id !== 'contact-form') return;
    event.preventDefault();
    const form = event.target;
    if (!form.reportValidity()) return;
    const status = form.querySelector('#form-status');
    if (!data.email) {
      status.textContent = 'This preview isn’t connected to an email address yet. Your message has not been sent.';
      return;
    }
    const values = new FormData(form);
    const subject = values.get('subject') || `Portfolio inquiry from ${values.get('name')}`;
    const body = `${values.get('message')}\n\nFrom: ${values.get('name')}\nEmail: ${values.get('email')}`;
    location.href = `mailto:${data.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    status.textContent = 'Your email app will open with this message. Send it there when you’re ready.';
  });

  overlay.querySelector('.overlay-close').addEventListener('click', requestClose);
  overlay.addEventListener('cancel', event => { event.preventDefault(); requestClose(); });
  overlay.addEventListener('click', event => {
    const next = event.target.closest('[data-overlay-next]');
    if (next) {
      event.preventDefault();
      const project = getProject(next.dataset.overlayNext);
      if (!project) return;
      overlayState.id = project.id;
      history.replaceState({ ...history.state, overlayProject: project.id }, '', `#/vfx/${project.id}`);
      overlayScroll.innerHTML = projectPage(project, true);
      overlayScroll.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
      document.title = `${project.title} — Tao Luo`;
    }
    if (event.target.closest('[data-overlay-all]')) {
      event.preventDefault();
      history.replaceState(null, '', '#/vfx');
      finishClose();
    }
  });
  photoOverlay.querySelector('.photo-close').addEventListener('click', () => photoOverlay.close());
  photoOverlay.querySelector('.photo-prev').addEventListener('click', () => showPhoto(activePhoto - 1));
  photoOverlay.querySelector('.photo-next').addEventListener('click', () => showPhoto(activePhoto + 1));
  photoOverlay.addEventListener('close', () => document.body.classList.remove('modal-open'));
  webInfoDialog.querySelector('.web-info-close').addEventListener('click', () => webInfoDialog.close());
  webInfoDialog.addEventListener('close', () => {
    if (!overlay.open && !photoOverlay.open) document.body.classList.remove('modal-open');
  });
  webInfoDialog.addEventListener('click', event => {
    if (event.target !== webInfoDialog) return;
    const bounds = webInfoDialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) webInfoDialog.close();
  });
  photoOverlay.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); showPhoto(activePhoto - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); showPhoto(activePhoto + 1); }
  });

  const themeToggle = document.querySelector('#theme-toggle');
  function syncTheme() {
    const isDark = document.documentElement.dataset.theme === 'dark';
    themeToggle.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`);
    themeToggle.title = `Switch to ${isDark ? 'light' : 'dark'} mode`;
    themeToggle.setAttribute('aria-pressed', String(!isDark));
    document.querySelector('meta[name="theme-color"]').content = isDark ? '#0a0a0b' : '#f0eee8';
  }
  themeToggle.addEventListener('click', () => {
    document.documentElement.dataset.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('tao-theme', document.documentElement.dataset.theme); } catch {}
    syncTheme();
  });
  document.querySelector('.mobile-menu-toggle').addEventListener('click', event => {
    const button = event.currentTarget;
    const open = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    document.querySelector('#primary-nav').classList.toggle('is-open', open);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      document.querySelector('#primary-nav').classList.remove('is-open');
      document.querySelector('.mobile-menu-toggle').setAttribute('aria-expanded', 'false');
    }
  });

  window.addEventListener('popstate', async () => {
    if (overlay.open) { await finishClose(); return; }
    if (history.state?.overlayProject) {
      const state = history.state;
      renderRoute(state.backgroundRoute || '/');
      window.scrollTo({ top: state.scrollY || 0, behavior: 'instant' });
      const source = main.querySelector(`[data-card="${state.overlayProject}"]`);
      openProject(state.overlayProject, source, { fromHistory: true });
      return;
    }
    if (getRoute() !== renderedRoute) renderRoute();
  });
  window.addEventListener('hashchange', () => {
    if (overlay.open || closing || history.state?.overlayProject) return;
    if (getRoute() !== renderedRoute) renderRoute();
  });

  renderFooter();
  syncTheme();
  renderRoute();
})();
