const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = __dirname;
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'site-data.js'), 'utf8'), context);
vm.runInNewContext(fs.readFileSync(path.join(root, 'photography-data.js'), 'utf8'), context);
const data = context.window.PORTFOLIO;
assert.equal(data.name, 'Tao Luo');
assert.ok(['wip', 'full'].includes(data.release), 'release must be wip or full');
assert.equal(data.socials.length, 5);
for (const file of ['index.html', 'styles.css', 'blog.css', 'accents.css', 'footer.css', 'contact.css', 'photogrammetry.css', 'app.js', 'site-info.json', 'generate-pages.cjs', 'generated-pages.json', '.nojekyll', 'assets/social-icons.svg']) assert.ok(fs.existsSync(path.join(root, file)), `Missing ${file}`);
const siteInfo = JSON.parse(fs.readFileSync(path.join(root, 'site-info.json'), 'utf8'));
assert.ok(Number.isFinite(Date.parse(siteInfo.updatedAt)), 'Invalid website update date');
for (const entry of [...data.projects, ...data.photographs, ...data.posts]) {
  for (const image of [entry.image, entry.secondary].filter(Boolean)) assert.ok(fs.existsSync(path.join(root, 'assets/images', image)), `Missing image: ${image}`);
}
const journalIds = new Set();
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
  for (const entry of post.entries) {
    assert.ok(!entryIds.has(entry.id), `Duplicate entry: ${post.id}/${entry.id}`);
    entryIds.add(entry.id);
    assert.ok(Array.isArray(entry.blocks), `Post blocks must be an array: ${entry.id}`);
    if (entry.image) assert.ok(fs.existsSync(path.join(root, 'assets/images', entry.image)), `Missing post cover: ${entry.image}`);
    for (const block of entry.blocks) {
      assert.ok(['image', 'video', 'heading', 'paragraph'].includes(block.type), `Unsupported content block: ${block.type}`);
      if (block.type === 'image') {
        assert.ok(fs.existsSync(path.join(root, 'assets/images', block.image)), `Missing article image: ${block.image}`);
        assert.ok(block.alt?.trim(), 'Article images need descriptive alt text');
      }
      if (block.type === 'video') {
        checkJournalLink(block.src);
        if (block.src.startsWith('/')) assert.ok(fs.existsSync(path.join(root, block.src.slice(1))), `Missing article video: ${block.src}`);
        assert.ok(block.title?.trim(), 'Article videos need an accessible title');
        assert.ok(fs.existsSync(path.join(root, 'assets/images', block.poster)), `Missing video poster: ${block.poster}`);
        assert.ok(block.credit?.trim() && block.sourceUrl, 'Article videos need attribution and a source link');
      }
      if (block.type === 'paragraph') checkJournalInline(block.children || block.text);
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
