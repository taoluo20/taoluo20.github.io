const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const { createHash } = require('node:crypto');
const root = __dirname;
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'site-data.js'), 'utf8'), context);
vm.runInNewContext(fs.readFileSync(path.join(root, 'vfx-data.js'), 'utf8'), context);
vm.runInNewContext(fs.readFileSync(path.join(root, 'reel-data.js'), 'utf8'), context);
vm.runInNewContext(fs.readFileSync(path.join(root, 'photography-data.js'), 'utf8'), context);
const data = context.window.PORTFOLIO;
const reelEdit = JSON.parse(fs.readFileSync(path.join(root, 'reel-edit.json'), 'utf8'));
const reelProjects = new Map(data.projects.filter(project => project.video && !reelEdit.excludedProjects.includes(project.id)).map(project => [project.id, project]));
const vfxDataHash = createHash('sha256').update(fs.readFileSync(path.join(root, 'vfx-data.js'), 'utf8').replace(/\r\n/g, '\n')).digest('hex');
assert.equal(data.reels.sourceDataHash, vfxDataHash, 'Reels must use the current VFX gallery data');
assert.equal(data.reels.clips.length, reelProjects.size, 'Use each eligible VFX gallery video exactly once');
assert.equal(new Set(data.reels.clips.map(clip => clip.projectId)).size, reelProjects.size, 'Duplicate reel source');
let reelDuration = 0;
for (const clip of data.reels.clips) {
  const project = reelProjects.get(clip.projectId);
  assert.ok(project, `Reel project is outside the VFX gallery: ${clip.projectId}`);
  assert.equal(clip.source, project.video, 'Use the published full video, not a journal clip or hover preview');
  assert.equal(clip.projectUrl, `/vfx/${project.id}/`);
  assert.ok(Math.abs(clip.fullDuration - project.duration) < 0.001, 'Keep the complete original in the Demo reel');
  assert.equal(clip.duration, Math.min(3, clip.fullDuration), 'Short videos must be included in full');
  assert.ok(clip.start >= 0 && clip.start + clip.duration <= clip.fullDuration + 0.01, 'Highlight is outside the source video');
  assert.ok(Math.abs(clip.offset - reelDuration) < 0.001, 'Chapter offsets must be continuous');
  assert.ok(fs.existsSync(path.join(root, clip.src.slice(1))), `Missing highlight: ${clip.src}`);
  assert.ok(fs.existsSync(path.join(root, 'assets/images', clip.poster)), `Missing highlight poster: ${clip.poster}`);
  reelDuration += clip.fullDuration;
}
for (const reel of data.reels.categories) {
  const file = path.join(root, reel.src.slice(1));
  assert.ok(fs.existsSync(file), `Missing reel: ${reel.src}`);
  assert.ok(fs.statSync(file).size < 95 * 1024 * 1024, 'Reel must fit static hosting');
  assert.ok(Math.abs(reel.duration - reelDuration) < 0.001, 'Demo must retain all original durations');
  assert.ok(fs.existsSync(path.join(root, 'demo', reel.id, 'index.html')), `Missing reel route: ${reel.id}`);
}
assert.equal(data.name, 'Tao Luo');
assert.ok(['wip', 'full'].includes(data.release), 'release must be wip or full');
assert.equal(data.socials.length, 5);
for (const file of ['index.html', 'styles.css', 'blog.css', 'accents.css', 'footer.css', 'contact.css', 'photogrammetry.css', 'vfx-access.css', 'app.js', 'site-info.json', 'generate-pages.cjs', 'generated-pages.json', '.nojekyll', 'assets/social-icons.svg']) assert.ok(fs.existsSync(path.join(root, file)), `Missing ${file}`);
const contentVersion = createHash('sha256').update(fs.readFileSync(path.join(root, 'site-data.js'), 'utf8').replace(/\r\n/g, '\n')).digest('hex').slice(0, 12);
const generatedPages = JSON.parse(fs.readFileSync(path.join(root, 'generated-pages.json'), 'utf8'));
for (const file of ['index.html', ...generatedPages]) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  assert.ok(html.includes(`src="/site-data.js?v=${contentVersion}"`), `Stale site data version in ${file}`);
}
const siteInfo = JSON.parse(fs.readFileSync(path.join(root, 'site-info.json'), 'utf8'));
assert.ok(Number.isFinite(Date.parse(siteInfo.updatedAt)), 'Invalid website update date');
for (const entry of [...data.projects, ...data.photographs, ...data.posts]) {
  for (const image of [entry.image, entry.secondary].filter(Boolean)) assert.ok(fs.existsSync(path.join(root, 'assets/images', image)), `Missing image: ${image}`);
}
const journalIds = new Set();
const projectIds = new Set();
for (const project of data.projects) {
  assert.match(project.id, /^[a-z0-9-]+$/, 'Invalid VFX project id');
  assert.ok(!projectIds.has(project.id), `Duplicate VFX project: ${project.id}`);
  projectIds.add(project.id);
  assert.ok(project.width > 0 && project.height > 0 && project.alt && project.description, `Incomplete VFX project: ${project.id}`);
  assert.ok(fs.existsSync(path.join(root, 'vfx', project.id, 'index.html')), `Missing VFX page: ${project.id}`);
  for (const media of [project.video, project.preview].filter(Boolean)) {
    assert.match(media, /^\/assets\/videos\/vfx\/[a-z0-9-]+\.mp4$/, 'VFX videos must use local assets');
    assert.ok(fs.existsSync(path.join(root, media)), `Missing VFX video: ${media}`);
  }
  if (project.video) assert.ok(project.preview, `Missing hover preview: ${project.id}`);
  if (project.fullImage) assert.ok(fs.existsSync(path.join(root, 'assets/images', project.fullImage)), `Missing full-size image: ${project.id}`);
  for (const id of project.software) assert.ok(fs.existsSync(path.join(root, 'assets/software', `${id}.${id === 'realityscan' ? 'png' : 'svg'}`)), `Missing software icon: ${id}`);
}
const checkJournalLink = href => {
  assert.match(href, /^(https:\/\/|\/(?!\/))/, `Invalid article link: ${href}`);
  if (href.startsWith('https://')) assert.equal(new URL(href).protocol, 'https:');
};
const checkJournalInline = content => {
  assert.ok(typeof content === 'string' || Array.isArray(content), 'Article text must be a string or inline runs');
  if (Array.isArray(content)) for (const part of content) {
    assert.equal(typeof part.text, 'string');
    if (part.href) checkJournalLink(part.href);
  }
};
for (const post of data.posts) {
  assert.ok(['Personal', 'SCAD'].includes(post.category), `Unknown Blog category: ${post.category}`);
  assert.ok(!journalIds.has(post.id), `Duplicate journal: ${post.id}`);
  journalIds.add(post.id);
  assert.ok(post.entries?.length, `Journal has no entries: ${post.id}`);
  const entryIds = new Set();
  const entryNumbers = new Set();
  for (const entry of post.entries) {
    const number = entry.number ?? post.entries.indexOf(entry) + 1;
    assert.ok(Number.isSafeInteger(number) && number > 0, `Invalid post number: ${entry.id}`);
    assert.ok(!entryNumbers.has(number), `Duplicate post number: ${number}`);
    entryNumbers.add(number);
    assert.ok(!entryIds.has(entry.id), `Duplicate entry: ${post.id}/${entry.id}`);
    entryIds.add(entry.id);
    assert.ok(Array.isArray(entry.blocks), `Post blocks must be an array: ${entry.id}`);
    if (entry.publishedAt) {
      assert.match(entry.publishedAt, /^\d{4}-\d{2}-\d{2}$/, 'Post publication dates must use YYYY-MM-DD');
      assert.equal(new Date(`${entry.publishedAt}T00:00:00Z`).toISOString().slice(0, 10), entry.publishedAt, 'Invalid post publication date');
    }
    if (entry.image) assert.ok(fs.existsSync(path.join(root, 'assets/images', entry.image)), `Missing post cover: ${entry.image}`);
    const blocks = entry.blocks.flatMap(block => {
      if (block.type !== 'mediaRow') return [block];
      assert.ok(Array.isArray(block.items) && block.items.length === 2, 'Media rows need two items');
      assert.ok(block.items.every(item => ['image', 'video'].includes(item.type)), 'Media row items must be images or videos');
      return block.items;
    });
    for (const block of blocks) {
      assert.ok(['image', 'video', 'youtube', 'heading', 'paragraph', 'list', 'table'].includes(block.type), `Unsupported content block: ${block.type}`);
      if (block.type === 'image') {
        assert.ok(fs.existsSync(path.join(root, 'assets/images', block.image)), `Missing article image: ${block.image}`);
        assert.ok(block.alt?.trim(), 'Article images need descriptive alt text');
      }
      if (block.type === 'video') {
        checkJournalLink(block.src);
        if (block.src.startsWith('/')) assert.ok(fs.existsSync(path.join(root, block.src.slice(1))), `Missing article video: ${block.src}`);
        assert.ok(block.title?.trim(), 'Article videos need an accessible title');
        assert.ok(fs.existsSync(path.join(root, 'assets/images', block.poster)), `Missing video poster: ${block.poster}`);
        if (block.src.startsWith('https://')) assert.ok(block.credit?.trim() && block.sourceUrl, 'External article videos need attribution and a source link');
      }
      if (block.type === 'youtube') {
        assert.match(block.videoId, /^[A-Za-z0-9_-]{11}$/, 'Invalid YouTube video id');
        assert.ok(block.title?.trim() && block.credit?.trim(), 'YouTube references need a title and creator credit');
        assert.equal(block.sourceUrl, `https://www.youtube.com/watch?v=${block.videoId}`, 'YouTube source must match the embedded video');
      }
      if (block.type === 'paragraph') checkJournalInline(block.children || block.text);
      if (block.type === 'table') {
        assert.ok(block.caption?.trim(), 'Article tables need a caption');
        assert.ok(Array.isArray(block.headers) && block.headers.length > 0, 'Article tables need column headings');
        assert.ok(block.headers.every(header => typeof header === 'string' && header.trim()), 'Table headings must not be empty');
        assert.ok(Array.isArray(block.rows) && block.rows.length > 0, 'Article tables need rows');
        for (const row of block.rows) {
          assert.equal(row.length, block.headers.length, 'Table rows must match their headings');
          row.forEach(checkJournalInline);
        }
      }
      if (block.type === 'list') {
        assert.ok(Array.isArray(block.items) && block.items.length > 0, 'Article lists must contain items');
        block.items.forEach(checkJournalInline);
      }
      if (block.type === 'heading') assert.ok(block.text?.trim(), 'Article headings must not be empty');
      if (block.caption) checkJournalInline(block.caption);
      if (block.sourceUrl) checkJournalLink(block.sourceUrl);
    }
  }
}
for (const social of data.socials) if (social.url) assert.equal(new URL(social.url).protocol, 'https:');
const photoIds = new Set();
for (const photo of data.photographs) {
  assert.match(photo.title, /^IMG_\d+$/, `Invalid public photograph name: ${photo.id}`);
  assert.ok(!photoIds.has(photo.id), `Duplicate photograph: ${photo.id}`);
  photoIds.add(photo.id);
  assert.ok(photo.width > 0 && photo.height > 0, `Invalid photograph size: ${photo.id}`);
  assert.ok(photo.sources?.length >= 2, `Missing responsive images: ${photo.id}`);
  for (const image of [...photo.sources.map(source => source.file), photo.largeImage, photo.jpegImage]) {
    assert.match(path.basename(image), /^IMG_\d+\.(webp|jpg)$/, `Unexpected web image suffix: ${image}`);
    assert.ok(fs.existsSync(path.join(root, 'assets/images', image)), `Missing photograph asset: ${image}`);
  }
  assert.ok(!('latitude' in photo) && !('longitude' in photo), `Precise GPS in public photograph data: ${photo.id}`);
  if (photo.locationConfirmed) assert.ok(!photo.location.startsWith('Near '), `Confirmed location still has Near: ${photo.id}`);
  if (photo.year && !photo.date) assert.ok(!photo.capturedAt, `Unknown month/day must stay unset: ${photo.id}`);
  assert.ok(fs.existsSync(path.join(root, 'photography', photo.id, 'index.html')), `Missing photograph page: ${photo.id}`);
}
console.log(`Site check passed (${data.release} release, five social links, all local assets present).`);
