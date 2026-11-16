(() => {
  'use strict';
  const data = window.PORTFOLIO.reels;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const image = file => `/assets/images/${file}`;
  const icon = name => `<img class="reel-icon" src="/assets/icons/lucide/${name}.svg" width="20" height="20" alt="" aria-hidden="true" />`;
  const clock = seconds => {
    const rounded = Math.round(seconds);
    return `${Math.floor(rounded / 60)}:${String(rounded % 60).padStart(2, '0')}`;
  };
  const category = id => data.categories.find(item => item.id === id);
  let dispose = () => {};

  function home() {
    const first = data.clips[0];
    return `<section class="reel-home" data-home-reel aria-labelledby="reel-home-title">
      <div class="reel-home-visual" aria-hidden="true">
        <img class="reel-home-poster" src="${image(first.poster)}" width="1280" height="720" alt="" fetchpriority="high" />
        <video class="reel-layer is-active" data-reel-slot muted playsinline disablepictureinpicture disableremoteplayback preload="none" poster="${image(first.poster)}" tabindex="-1"></video>
        <video class="reel-layer" data-reel-slot muted playsinline disablepictureinpicture disableremoteplayback preload="none" tabindex="-1"></video>
      </div>
      <div class="reel-home-copy"><h1 id="reel-home-title">TAO<br><span>LUO</span></h1></div>
    </section>`;
  }

  function index() {
    return `<section class="reel-index" aria-labelledby="reel-index-title"><header class="reel-page-heading"><h1 id="reel-index-title">Demo<span class="wip-period">.</span></h1></header><div class="reel-category-grid${data.categories.length === 1 ? ' is-single' : ''}">${data.categories.map(item => `<a class="reel-category" href="/demo/${escape(item.id)}/" aria-label="Watch ${escape(item.title)} reel"><div class="reel-category-image"><img src="${image(item.poster)}" width="1280" height="720" alt="${escape(item.title)} reel: ${escape(data.clips[0].title)}" /><span class="reel-category-play">${icon('play')}</span><span class="reel-category-duration meta">${clock(item.duration)}</span></div><div class="reel-category-name"><h2>${escape(item.title)}</h2>${icon('arrow-up-right')}</div></a>`).join('')}</div></section>`;
  }

  function reel(id) {
    const item = category(id);
    if (!item) return '';
    return `<section class="reel-detail" data-reel-detail aria-labelledby="reel-detail-title"><a class="reel-back meta" href="/demo/">${icon('arrow-left')} DEMO</a><header class="reel-detail-heading"><h1 id="reel-detail-title">${escape(item.title)}<span class="wip-period">.</span></h1><span class="meta">${String(data.clips.length).padStart(2, '0')} FILMS <span aria-hidden="true">/</span> ${clock(item.duration)}</span></header><video class="reel-player" controls playsinline preload="metadata" poster="${image(item.poster)}" src="${escape(item.src)}" aria-label="Tao Luo ${escape(item.title)} reel"><a href="${escape(item.src)}">Open ${escape(item.title)} reel</a></video><div class="reel-detail-bottom"><label class="reel-chapters"><span class="meta">CHAPTER</span><select data-reel-chapter aria-label="Reel chapter">${data.clips.map((clip, i) => `<option value="${i}">${String(i + 1).padStart(2, '0')} / ${escape(clip.title)}</option>`).join('')}</select></label><a class="text-link" data-reel-project-link href="${escape(data.clips[0].projectUrl)}">VIEW PROJECT ${icon('arrow-up-right')}</a></div><p class="reel-playback-error" data-reel-error role="status" hidden>Video unavailable. <a href="${escape(item.src)}">Open the video directly</a>.</p></section>`;
  }

  function bindHome(root) {
    const controller = new AbortController();
    const signal = controller.signal;
    const slots = [...root.querySelectorAll('[data-reel-slot]')];
    const timers = new Set();
    let current = 0;
    let active = 0;
    let generation = 0;
    let visible = true;
    let initialized = false;
    let disposed = false;
    let changing = false;
    let fadeDone = Promise.resolve();
    const canPlay = () => !motion.matches && visible && !document.hidden && !disposed;
    const later = (fn, delay) => {
      const timer = setTimeout(() => { timers.delete(timer); fn(); }, delay);
      timers.add(timer);
      return timer;
    };
    const prepare = (video, index) => {
      if (video.dataset.index === String(index)) return;
      const clip = data.clips[index];
      video.dataset.index = String(index);
      video.poster = image(clip.poster);
      video.src = clip.src;
      video.preload = 'auto';
      video.muted = true;
      video.load();
    };
    const ready = video => new Promise(resolve => {
      if (video.readyState >= 2) { resolve(true); return; }
      if (video.error) { resolve(false); return; }
      let settled = false;
      const finish = success => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        timers.delete(timer);
        video.removeEventListener('loadeddata', loaded);
        video.removeEventListener('error', failed);
        signal.removeEventListener('abort', failed);
        resolve(success);
      };
      const loaded = () => finish(true);
      const failed = () => finish(false);
      const timer = later(failed, 8000);
      video.addEventListener('loadeddata', loaded, { once: true });
      video.addEventListener('error', failed, { once: true });
      signal.addEventListener('abort', failed, { once: true });
    });
    const play = async video => {
      if (!canPlay() || video.ended) return;
      try { await video.play(); } catch { /* Keep the decorative still if autoplay is unavailable. */ }
    };
    const waitForFade = () => {
      if (motion.matches) return Promise.resolve();
      return new Promise(resolve => {
        const finish = () => { signal.removeEventListener('abort', finish); resolve(); };
        signal.addEventListener('abort', finish, { once: true });
        later(finish, 500);
      });
    };
    const change = async (index, skipped = 0) => {
      const next = (index + data.clips.length) % data.clips.length;
      changing = true;
      const request = ++generation;
      // Reuse a video layer only after its previous fade has finished.
      await fadeDone;
      if (disposed || request !== generation) return;
      const incomingIndex = 1 - active;
      const incoming = slots[incomingIndex];
      prepare(incoming, next);
      const loaded = await ready(incoming);
      if (disposed || request !== generation) return;
      if (!loaded) {
        changing = false;
        if (skipped + 1 < data.clips.length && canPlay()) change(next + 1, skipped + 1);
        return;
      }
      incoming.currentTime = 0;
      const outgoing = slots[active];
      outgoing.pause();
      outgoing.classList.remove('is-active');
      incoming.classList.add('is-active');
      active = incomingIndex;
      current = next;
      changing = false;
      play(incoming);
      fadeDone = waitForFade();
      fadeDone.then(() => {
        if (!disposed && !motion.matches && request === generation) prepare(outgoing, (current + 1) % data.clips.length);
      });
    };
    const syncPlayback = () => {
      if (!canPlay()) { for (const video of slots) video.pause(); return; }
      if (!initialized) {
        initialized = true;
        prepare(slots[active], current);
        prepare(slots[1 - active], (current + 1) % data.clips.length);
      }
      if (changing) return;
      if (slots[active].ended || slots[active].error) change(current + 1);
      else play(slots[active]);
    };
    for (const video of slots) {
      const advance = () => { if (video === slots[active] && canPlay() && !changing) change(current + 1); };
      video.addEventListener('ended', advance, { signal });
      video.addEventListener('error', advance, { signal });
    }
    document.addEventListener('visibilitychange', syncPlayback, { signal });
    motion.addEventListener('change', syncPlayback, { signal });
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; syncPlayback(); });
    observer.observe(root);
    syncPlayback();
    dispose = () => {
      disposed = true;
      generation++;
      controller.abort();
      observer.disconnect();
      for (const timer of timers) clearTimeout(timer);
      for (const video of slots) { video.pause(); video.removeAttribute('src'); video.load(); }
    };
  }

  function bindDetail(root) {
    const controller = new AbortController();
    const video = root.querySelector('video');
    const chapters = root.querySelector('[data-reel-chapter]');
    const options = { signal: controller.signal };
    const update = index => { root.querySelector('[data-reel-project-link]').href = data.clips[index].projectUrl; };
    chapters.addEventListener('change', () => {
      const index = Number(chapters.value);
      video.currentTime = data.clips[index].offset;
      update(index);
      video.play().catch(() => {});
    }, options);
    video.addEventListener('timeupdate', () => {
      const index = data.clips.findLastIndex(clip => clip.offset <= video.currentTime + 0.02);
      if (index < 0) return;
      if (document.activeElement !== chapters) chapters.value = String(index);
      update(index);
    }, options);
    video.addEventListener('error', () => { root.querySelector('[data-reel-error]').hidden = false; }, options);
    if (!motion.matches) video.play().catch(() => {});
    dispose = () => { controller.abort(); video.pause(); video.removeAttribute('src'); video.load(); };
  }

  window.Showcase = {
    home, index, reel, category,
    cleanup() { dispose(); dispose = () => {}; },
    bind(main) {
      const hero = main.querySelector('[data-home-reel]');
      const detail = main.querySelector('[data-reel-detail]');
      if (hero) bindHome(hero);
      else if (detail) bindDetail(detail);
    }
  };
})();
