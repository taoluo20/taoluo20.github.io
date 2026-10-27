(() => {
  'use strict';
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const asset = file => `/assets/images/${file}`;
  const photos = () => window.PORTFOLIO.photographs;
  const timers = new Map();
  let resizeHandler;
  let keyHandler;
  let outsideHandler;
  let currentKind = '';
  let previousKind = '';
  let galleryScroll = 0;
  let galleryRoute = '/photography/';
  let selectedId;
  try {
    const saved = JSON.parse(sessionStorage.getItem('tao-photo-gallery'));
    if (saved && Number.isFinite(saved.scroll) && saved.scroll >= 0 && /^\/photography\/(?:\?.*)?$/.test(saved.route)) {
      galleryScroll = saved.scroll;
      galleryRoute = saved.route;
    }
  } catch {}

  const getPhoto = id => photos().find(photo => photo.id === id);
  const availablePlaces = () => [...new Map(photos().filter(photo => photo.locationKey).map(photo => [photo.locationKey, [photo.locationLabel, photo.country].filter(Boolean).join(', ')])).entries()];
  const filterQuery = (year, place) => {
    const params = new URLSearchParams();
    if (year) params.set('year', year);
    if (place) params.set('place', place);
    return params.size ? `?${params}` : '';
  };
  const filterState = params => {
    let year = params.get('year') || '';
    const hasUndated = photos().some(photo => !photo.year);
    if (year === 'undated' && !hasUndated) year = '2023';
    if (!photos().some(photo => String(photo.year) === year) && !(year === 'undated' && hasUndated)) year = '';
    const requestedPlace = params.get('place') || '';
    const place = availablePlaces().some(([key]) => key === requestedPlace) ? requestedPlace : '';
    return { year, place };
  };
  const filterPhotos = ({ year, place }) => photos().filter(photo => (!year || (year === 'undated' ? !photo.year : String(photo.year) === year)) && (!place || photo.locationKey === place));
  const columns = () => window.matchMedia('(max-width: 640px)').matches ? 1 : window.matchMedia('(max-width: 1050px)').matches ? 2 : 3;
  const bytes = value => value >= 1000000 ? `${(value / 1000000).toFixed(1)} MB` : `${Math.round(value / 1000)} KB`;
  const shutter = value => {
    if (typeof value === 'number') return value < 1 ? `1/${Math.round(1 / value)} s` : `${value} s`;
    return value ? `${value} s` : '';
  };
  const aperture = value => value ? `f/${value}` : '';
  const dateLabel = value => value ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(value + 'T12:00:00Z')) : '';
  const summary = photo => [aperture(photo.camera?.aperture), shutter(photo.camera?.shutter), photo.camera?.iso && `ISO ${photo.camera.iso}`].filter(Boolean).join(' / ');

  function picture(photo, detail = false, priority = false) {
    const sizes = detail ? '(max-width: 800px) calc(100vw - 40px), 64vw' : '(max-width: 640px) calc(100vw - 36px), (max-width: 1050px) calc((100vw - 72px) / 2), calc((100vw - 128px) / 3)';
    return `<picture><source type="image/webp" srcset="${photo.sources.map(source => `${asset(source.file)} ${source.width}w`).join(', ')}" sizes="${sizes}"><img src="${asset(photo.jpegImage)}" alt="${escape(photo.alt)}" width="${photo.width}" height="${photo.height}" ${priority ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></picture>`;
  }

  function card(photo, index, query) {
    return `<article class="photograph" data-photo-card="${photo.id}" data-photo-order="${index}"><a class="photograph-link" href="/photography/${photo.id}/${query}" aria-label="View ${escape(photo.title)}"><figure class="photograph-image">${picture(photo, false, index < 3)}</figure><div class="photograph-label"><h2>${escape(photo.title)}</h2>${photo.year ? `<span>${photo.year}</span>` : ''}</div><div class="photograph-preview" aria-hidden="true"><div class="photograph-preview-inner">${photo.location ? `<p class="photograph-location">${escape(photo.location)}</p>` : ''}${photo.camera ? `<p class="photograph-camera">${escape(photo.camera.model)}</p><p class="photograph-settings">${escape(summary(photo))}</p>` : `<p class="photograph-settings">${photo.width} &times; ${photo.height} px</p>`}${photo.date ? `<time datetime="${photo.date}">${dateLabel(photo.date)}</time>` : ''}</div></div></a></article>`;
  }

  function gallery(params) {
    const { year, place } = filterState(params);
    const availableYears = [...new Set(photos().map(photo => photo.year).filter(Boolean))].sort((a, b) => b - a);
    const selection = filterPhotos({ year, place });
    const yearSelection = filterPhotos({ year, place: '' });
    const query = filterQuery(year, place);
    const count = columns();
    const groups = Array.from({ length: count }, () => []);
    selection.forEach((photo, index) => groups[index % count].push(card(photo, index, query)));
    const filters = [['', 'All'], ...availableYears.map(value => [String(value), String(value)]), ...(photos().some(photo => !photo.year) ? [['undated', 'Undated']] : [])];
    const options = [['', 'All locations'], ...availablePlaces()];
    const tools = `<div class="photography-filter-tools"><button class="location-filter-button${place ? ' is-active' : ''}" aria-label="Filter by location" title="Filter by location" aria-expanded="false" aria-controls="location-filter-panel" aria-haspopup="dialog"><span class="location-filter-icon" aria-hidden="true"></span></button><span class="photography-count">${String(selection.length).padStart(2, '0')} PHOTOS</span><div id="location-filter-panel" class="location-filter-panel" role="dialog" aria-label="Filter by location" hidden><fieldset><legend>Location</legend>${options.map(([value, label]) => {
      const count = value ? yearSelection.filter(photo => photo.locationKey === value).length : yearSelection.length;
      return `<label><input type="radio" name="photo-location" value="${escape(value)}" ${value === place ? 'checked' : ''} ${count ? '' : 'disabled'}><span>${escape(label)}</span><span class="location-option-count">${count}</span></label>`;
    }).join('')}</fieldset></div></div>`;
    const content = selection.length ? `<div class="photograph-columns" data-photo-columns="${count}">${groups.map(group => `<div class="photograph-column">${group.join('')}</div>`).join('')}</div>` : `<div class="photography-empty"><p>No photographs in this selection.</p><a href="/photography/${filterQuery(year, '')}">All locations</a></div>`;
    return `<section class="photography-collection"><header class="photography-heading"><div><p class="photography-kicker">TAO LUO / PHOTOGRAPHS</p><h1>Photography<span>.</span></h1></div><div class="photography-edition"><span>${Math.min(...availableYears)} &ndash; ${Math.max(...availableYears)}</span><span>${String(photos().length).padStart(2, '0')} SELECTED PHOTOGRAPHS</span></div></header><nav class="photography-filters" aria-label="Photography years">${filters.map(([value, label]) => `<a href="/photography/${filterQuery(value, place)}" ${year === value ? 'aria-current="page"' : ''}>${label}</a>`).join('')}${tools}</nav>${content}</section>`;
  }

  function detail(photo, params) {
    const { year, place } = filterState(params);
    const selection = filterPhotos({ year, place });
    const sequence = selection.some(item => item.id === photo.id) ? selection : photos();
    const index = sequence.indexOf(photo);
    const previous = sequence[(index - 1 + sequence.length) % sequence.length];
    const next = sequence[(index + 1) % sequence.length];
    const query = filterQuery(year, place);
    const camera = photo.camera;
    let originalWidth = photo.originalWidth;
    let originalHeight = photo.originalHeight;
    if ([5, 6, 7, 8].includes(photo.originalOrientation) || /90|270|Transpose|Transverse/i.test(String(photo.originalOrientation))) [originalWidth, originalHeight] = [originalHeight, originalWidth];
    const entries = [
      ['Camera', camera?.model],
      ['Lens', camera?.lens],
      ['Aperture', aperture(camera?.aperture)],
      ['Shutter speed', shutter(camera?.shutter)],
      ['ISO', camera?.iso],
      ['Focal length', camera?.focalLength],
      ['35mm equivalent', camera?.focalLength35mm],
      ['Exposure bias', camera?.exposureCompensation],
      ['Captured', photo.date ? dateLabel(photo.date) : photo.year],
      ['Local time', photo.capturedAt ? photo.capturedAt.replace(/^\d{4}:\d{2}:\d{2}\s/, '') : null],
      ['Location', photo.location],
      ['Original format', photo.originalFormat],
      ['Original size', originalWidth && originalHeight ? `${originalWidth} × ${originalHeight} px` : null],
      ['Edited size', `${photo.width} × ${photo.height} px`],
      ['Web image', `${photo.webWidth} × ${photo.webHeight} px / ${bytes(photo.webBytes)}`],
    ].filter(([, value]) => value !== null && value !== undefined && value !== '');
    return `<article class="photography-detail"><a class="photography-back" href="/photography/${query}">ALL PHOTOGRAPHS</a><div class="photography-detail-layout"><figure class="photography-detail-image"><a href="${asset(photo.largeImage)}" target="_blank" rel="noopener" title="Open full-size photograph">${picture(photo, true, true)}</a></figure><aside class="photography-info"><p class="photography-kicker">TAO LUO / ${String(index + 1).padStart(2, '0')} OF ${String(sequence.length).padStart(2, '0')}</p><h1>${escape(photo.title)}</h1>${photo.year ? `<p class="photography-detail-year">${photo.year}</p>` : ''}<dl class="photography-metadata">${entries.map(([label, value]) => `<div><dt>${label}</dt><dd>${escape(value)}</dd></div>`).join('')}</dl></aside></div><nav class="photography-sequence" aria-label="Photograph navigation"><a href="/photography/${previous.id}/${query}" rel="prev"><span>PREVIOUS</span><strong>${escape(previous.title)}</strong></a><a class="photography-sequence-all" href="/photography/${query}">ALL PHOTOGRAPHS</a><a href="/photography/${next.id}/${query}" rel="next"><span>NEXT</span><strong>${escape(next.title)}</strong></a></nav></article>`;
  }

  function setExpanded(card, expanded) {
    card.classList.toggle('is-expanded', expanded);
    card.querySelector('.photograph-preview').setAttribute('aria-hidden', String(!expanded));
  }

  function cleanup() {
    if (currentKind === 'gallery') {
      galleryScroll = window.scrollY;
      try { sessionStorage.setItem('tao-photo-gallery', JSON.stringify({ scroll: galleryScroll, route: galleryRoute })); } catch {}
    }
    previousKind = currentKind;
    currentKind = '';
    timers.forEach(timer => clearTimeout(timer));
    timers.clear();
    if (resizeHandler) window.removeEventListener('resize', resizeHandler);
    if (keyHandler) window.removeEventListener('keydown', keyHandler);
    if (outsideHandler) document.removeEventListener('click', outsideHandler);
    resizeHandler = null;
    keyHandler = null;
    outsideHandler = null;
  }

  function bind(main, id, navigate) {
    currentKind = id ? 'detail' : 'gallery';
    if (id) {
      selectedId = id;
      keyHandler = event => {
        if (event.altKey || event.ctrlKey || event.metaKey || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
        const selector = { Escape: '.photography-back', ArrowLeft: '[rel="prev"]', ArrowRight: '[rel="next"]' }[event.key];
        const link = selector && main.querySelector(selector);
        if (link) { event.preventDefault(); navigate(link.getAttribute('href')); }
      };
      window.addEventListener('keydown', keyHandler);
      return;
    }
    galleryRoute = location.pathname + location.search;
    const tools = main.querySelector('.photography-filter-tools');
    const filterButton = tools.querySelector('.location-filter-button');
    const filterPanel = tools.querySelector('.location-filter-panel');
    const closeFilter = () => { filterPanel.hidden = true; filterButton.setAttribute('aria-expanded', 'false'); };
    filterButton.addEventListener('click', () => {
      const open = filterPanel.hidden;
      filterPanel.hidden = !open;
      filterButton.setAttribute('aria-expanded', String(open));
      if (open) filterPanel.querySelector('input:checked').focus();
    });
    filterPanel.addEventListener('change', event => {
      if (!event.target.matches('input[name="photo-location"]')) return;
      const state = filterState(new URLSearchParams(location.search));
      navigate('/photography/' + filterQuery(state.year, event.target.value));
    });
    outsideHandler = event => { if (!tools.contains(event.target)) closeFilter(); };
    document.addEventListener('click', outsideHandler);
    keyHandler = event => {
      if (event.key === 'Escape' && !filterPanel.hidden) { event.preventDefault(); closeFilter(); filterButton.focus(); }
    };
    window.addEventListener('keydown', keyHandler);
    const container = main.querySelector('.photograph-columns');
    if (!container) return;
    const cards = [...container.querySelectorAll('[data-photo-card]')].sort((a, b) => Number(a.dataset.photoOrder) - Number(b.dataset.photoOrder));
    for (const item of cards) {
      item.addEventListener('pointerenter', event => {
        if (event.pointerType === 'touch' || !window.matchMedia('(hover: hover)').matches) return;
        clearTimeout(timers.get(item));
        timers.set(item, setTimeout(() => { timers.delete(item); setExpanded(item, true); }, 700));
      });
      item.addEventListener('pointerleave', () => {
        clearTimeout(timers.get(item));
        timers.delete(item);
        setExpanded(item, false);
      });
      item.addEventListener('focusin', () => setExpanded(item, true));
      item.addEventListener('focusout', () => setExpanded(item, false));
    }
    resizeHandler = () => {
      const count = columns();
      if (Number(container.dataset.photoColumns) === count) return;
      const groups = Array.from({ length: count }, () => {
        const element = document.createElement('div');
        element.className = 'photograph-column';
        return element;
      });
      cards.forEach((item, index) => groups[index % count].appendChild(item));
      container.replaceChildren(...groups);
      container.dataset.photoColumns = String(count);
    };
    window.addEventListener('resize', resizeHandler);
    if (previousKind === 'detail' && location.pathname + location.search === galleryRoute) {
      requestAnimationFrame(() => {
        window.scrollTo({ top: galleryScroll, behavior: 'instant' });
        cards.find(item => item.dataset.photoCard === selectedId)?.querySelector('a').focus({ preventScroll: true });
      });
    }
  }

  window.Photography = {
    getPhoto,
    normalizeRoute(route) {
      const url = new URL(route, location.origin);
      if (url.pathname.startsWith('/photography/') && url.searchParams.get('year') === 'undated' && !photos().some(photo => !photo.year)) {
        url.searchParams.set('year', '2023');
        return url.pathname + url.search;
      }
      return route;
    },
    render(id, params = new URLSearchParams()) {
      const photo = id && getPhoto(id);
      return id ? photo ? detail(photo, params) : null : gallery(params);
    },
    bind,
    cleanup,
  };
})();
