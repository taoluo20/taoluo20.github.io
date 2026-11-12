(() => {
  'use strict';
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const image = name => `/assets/images/${name}`;
  const arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg>';
  const back = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5m7-7-7 7 7 7"/></svg>';
  const software = {
    blender: 'Blender', houdini: 'Houdini', karma: 'Karma Render', unrealengine: 'Unreal Engine',
    maya: 'Autodesk Maya', arnold: 'Arnold', painter: 'Substance 3D Painter', fab: 'Fab', realityscan: 'RealityScan'
  };
  const disposers = [];
  const duration = seconds => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

  function tools(project) {
    return `<ul class="vfx-software" aria-label="Software and tools">${project.software.map(id => `<li><span class="vfx-software-icon" tabindex="0" role="img" aria-label="${software[id]}"><img src="/assets/software/${id}.${id === 'realityscan' ? 'png' : 'svg'}?v=20261112-renderers" alt="" width="32" height="32" /><span class="vfx-tooltip">${software[id]}</span></span></li>`).join('')}</ul>`;
  }

  function card(project, index) {
    return `<article class="vfx-work" data-vfx-work="${project.id}"><a class="vfx-work-link" href="/vfx/${project.id}/" aria-label="View ${escape(project.title)}">
      <div class="vfx-work-media" style="--media-ratio:${project.width}/${project.height}">
        <img src="${image(project.image)}" alt="${escape(project.alt)}" width="${project.width}" height="${project.height}" loading="${index < 2 ? 'eager' : 'lazy'}" decoding="async" />
        ${project.preview ? `<video class="vfx-preview" data-preview="${escape(project.preview)}" muted loop playsinline preload="none" aria-hidden="true" tabindex="-1" disablepictureinpicture></video>` : ''}
        <span class="vfx-work-open" aria-hidden="true">${arrow}</span>
      </div>
      <div class="vfx-work-caption"><h2>${escape(project.title)}</h2><span class="vfx-work-type meta">${escape(project.type)}</span>${project.duration ? `<span class="vfx-work-duration meta">${duration(project.duration)}</span>` : ''}</div>
    </a></article>`;
  }

  function render() {
    const projects = window.PORTFOLIO.projects;
    return `<section class="vfx-gallery" aria-labelledby="vfx-title"><header class="vfx-heading"><h1 id="vfx-title">VFX<span aria-hidden="true">.</span></h1><span class="meta">${String(projects.length).padStart(2, '0')} PROJECTS</span></header><div class="vfx-grid">${projects.map(card).join('')}</div></section>`;
  }

  function project(project) {
    const projects = window.PORTFOLIO.projects;
    const index = projects.indexOf(project);
    const previous = projects[(index - 1 + projects.length) % projects.length];
    const next = projects[(index + 1) % projects.length];
    const media = project.video
      ? `<video class="vfx-full-video" controls playsinline preload="metadata" poster="${image(project.image)}" width="${project.width}" height="${project.height}" aria-label="${escape(project.title)}"><source src="${escape(project.video)}" type="video/mp4" /><a href="${escape(project.video)}">Open video</a></video>`
      : `<a class="vfx-full-image" href="${image(project.fullImage || project.image)}" target="_blank" rel="noopener noreferrer" aria-label="Open full-size ${escape(project.title)}"><img src="${image(project.fullImage || project.image)}" alt="${escape(project.alt)}" width="${project.width}" height="${project.height}" decoding="async" /></a>`;
    return `<article class="vfx-project" data-project-content="${project.id}"><a class="vfx-back meta" href="/vfx/">${back} ALL PROJECTS</a>
      <header class="vfx-project-heading"><h1>${escape(project.title)}</h1><span class="meta">${escape(project.type)}</span></header>
      <figure class="vfx-project-media" style="--media-ratio:${project.width}/${project.height}">${media}</figure>
      <div class="vfx-project-info">${tools(project)}</div>
      <nav class="vfx-project-nav" aria-label="More VFX projects"><a href="/vfx/${previous.id}/" rel="prev">${back}<span><span class="meta">PREVIOUS</span><span>${escape(previous.title)}</span></span></a><a href="/vfx/${next.id}/" rel="next"><span><span class="meta">NEXT</span><span>${escape(next.title)}</span></span>${arrow}</a></nav>
    </article>`;
  }

  function bind(root) {
    const previews = [...root.querySelectorAll('.vfx-preview')];
    const stop = video => {
      video.dataset.active = 'false';
      video.pause();
      video.closest('.vfx-work').classList.remove('is-playing');
      if (video.readyState) video.currentTime = 0;
    };
    const start = video => {
      if (document.hidden) return;
      previews.forEach(other => { if (other !== video) stop(other); });
      video.dataset.active = 'true';
      video.muted = true;
      if (!video.getAttribute('src')) video.src = video.dataset.preview;
      video.play().catch(() => stop(video));
    };
    previews.forEach(video => {
      const link = video.closest('a');
      const play = () => { if (video.dataset.active === 'true') video.closest('.vfx-work').classList.add('is-playing'); else video.pause(); };
      const enter = event => { if (event.pointerType !== 'touch') start(video); };
      const focus = () => start(video);
      const leave = () => stop(video);
      video.addEventListener('playing', play);
      link.addEventListener('pointerenter', enter);
      link.addEventListener('pointerleave', leave);
      link.addEventListener('focus', focus);
      link.addEventListener('blur', leave);
      disposers.push(() => {
        stop(video);
        video.removeEventListener('playing', play);
        link.removeEventListener('pointerenter', enter);
        link.removeEventListener('pointerleave', leave);
        link.removeEventListener('focus', focus);
        link.removeEventListener('blur', leave);
        video.removeAttribute('src');
        video.load();
      });
    });
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (!entry.isIntersecting) stop(entry.target); });
    });
    previews.forEach(video => observer.observe(video));
    const pauseAll = () => { if (document.hidden) previews.forEach(stop); };
    document.addEventListener('visibilitychange', pauseAll);
    disposers.push(() => { observer.disconnect(); document.removeEventListener('visibilitychange', pauseAll); });
    root.querySelectorAll('.vfx-full-video').forEach(video => disposers.push(() => video.pause()));
  }

  function cleanup() { disposers.splice(0).forEach(dispose => dispose()); }
  window.Vfx = { render, project, bind, cleanup };
})();
