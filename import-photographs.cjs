const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');

const root = __dirname;
const catalogPath = process.env.PHOTO_CATALOG || path.resolve(root, '../../Photography/dlv/for_web/_catalog/photos.json');
const sharpPath = process.env.SHARP_MODULE || require.resolve('sharp', {
  paths: [path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules')],
});
const sharp = require(sharpPath);
const manifest = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const output = path.join(root, 'assets/images/photography');
const digest = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const dataFile = path.join(root, 'photography-data.js');
const previous = { window: { PORTFOLIO: {} } };
if (fs.existsSync(dataFile)) vm.runInNewContext(fs.readFileSync(dataFile, 'utf8'), previous);
const previousImages = new Set((previous.window.PORTFOLIO.photographs || []).flatMap(photo => [photo.image, photo.largeImage, photo.jpegImage, ...photo.sources.map(source => source.file)]));

(async () => {
  fs.mkdirSync(output, { recursive: true });
  const photographs = [];
  for (const record of manifest.photos.filter(photo => photo.status === 'paired')) {
    const input = record.files.edited.path;
    if (digest(input) !== record.files.edited.sha256) throw new Error(`Edited file changed since review: ${record.id}`);
    const id = record.id.toLowerCase().replaceAll('_', '-');
    const name = record.displayName || `IMG_${record.id.match(/^IMG_(\d+)/)?.[1]}`;
    if (!/^IMG_\d+$/.test(name)) throw new Error(`Invalid web photograph name: ${name}`);
    const image = sharp(input).rotate().toColourspace('srgb');
    const metadata = await image.metadata();
    const sources = [];
    for (const edge of [640, 1200, 2400]) {
      const filename = `${edge}/${name}.webp`;
      fs.mkdirSync(path.join(output, String(edge)), { recursive: true });
      const result = await image.clone().resize({ width: edge, height: edge, fit: 'inside', withoutEnlargement: true })
        .withIccProfile('srgb').webp({ quality: edge === 2400 ? 88 : 84, effort: 5 }).toFile(path.join(output, filename));
      sources.push({ file: `photography/${filename}`, width: result.width, height: result.height, bytes: result.size });
    }
    const jpeg = `2400/${name}.jpg`;
    const jpegInfo = await image.clone().resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true })
      .withIccProfile('srgb').jpeg({ quality: 89, mozjpeg: true }).toFile(path.join(output, jpeg));
    const near = record.location?.nearestPopulatedPlace;
    const confirmed = record.location?.confirmedPlaceName;
    photographs.push({
      id,
      title: name,
      alt: `Photograph ${name} by Tao Luo`,
      image: sources[1].file,
      largeImage: sources[2].file,
      jpegImage: `photography/${jpeg}`,
      sources,
      width: metadata.autoOrient?.width || metadata.width,
      height: metadata.autoOrient?.height || metadata.height,
      webWidth: sources[2].width,
      webHeight: sources[2].height,
      webBytes: sources[2].bytes,
      jpegBytes: jpegInfo.size,
      originalWidth: record.files.original.width,
      originalHeight: record.files.original.height,
      originalOrientation: record.files.original.orientation,
      originalFormat: path.extname(record.files.original.name).slice(1).toUpperCase(),
      year: record.capture?.year || null,
      date: record.capture?.localDate || null,
      capturedAt: record.capture?.rawValue || null,
      timeOffset: record.capture?.offset || null,
      location: confirmed || (near ? `Near ${near.city}, ${near.region}, ${near.country}` : null),
      locationKey: record.location?.confirmedPlaceKey || null,
      locationLabel: record.location?.confirmedPlaceLabel || near?.city || null,
      locationConfirmed: Boolean(confirmed),
      country: record.location?.confirmedCountry || near?.country || null,
      camera: record.camera,
    });
    console.log(`${record.id}: ${Math.round(sources[1].bytes / 1024)} KB list / ${Math.round(sources[2].bytes / 1024)} KB detail`);
  }
  photographs.sort((a, b) => (b.date || String(b.year || '')).localeCompare(a.date || String(a.year || '')) || a.id.localeCompare(b.id));
  fs.writeFileSync(dataFile, '/* Generated from the reviewed local photo catalog. No precise GPS or original file paths. */\nwindow.PORTFOLIO.photographs = ' + JSON.stringify(photographs, null, 2) + ';\n', 'utf8');
  if (/"(?:latitude|longitude|sourcePath|sha256)"/.test(fs.readFileSync(dataFile, 'utf8'))) throw new Error('Private catalog fields leaked into website data');
  const currentImages = new Set(photographs.flatMap(photo => [photo.image, photo.largeImage, photo.jpegImage, ...photo.sources.map(source => source.file)]));
  for (const file of previousImages) {
    if (currentImages.has(file) || !/^photography\/(?:[a-z0-9-]+-(?:640|1200|2400)\.(?:webp|jpg)|(?:640|1200|2400)\/(?:MIG|IMG)_\d+\.(?:webp|jpg))$/.test(file)) continue;
    const obsolete = path.resolve(root, 'assets/images', file);
    if (!obsolete.startsWith(output + path.sep)) throw new Error(`Unsafe obsolete image path: ${file}`);
    if (fs.existsSync(obsolete)) fs.unlinkSync(obsolete);
  }
  console.log(`Imported ${photographs.length} photographs.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
