const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createHash } = require('node:crypto');
const { spawnSync } = require('node:child_process');

const root = __dirname;
const ffmpeg = process.env.FFMPEG_PATH || 'ffmpeg';
const inspect = process.argv.includes('--inspect');
const context = { window: {} };
for (const name of ['site-data.js', 'vfx-data.js']) vm.runInNewContext(fs.readFileSync(path.join(root, name), 'utf8'), context);
const data = context.window.PORTFOLIO;
const editConfig = JSON.parse(fs.readFileSync(path.join(root, 'reel-edit.json'), 'utf8'));
const work = path.join(root, '.preview', 'reel-build');
const videoDir = path.join(root, 'assets', 'videos', 'reels');
const imageDir = path.join(root, 'assets', 'images', 'reels');
for (const dir of [work, videoDir, imageDir]) fs.mkdirSync(dir, { recursive: true });

function run(args) {
  const result = spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 });
  if (result.error || result.status !== 0) throw new Error(result.error?.message || result.stderr);
}

// The live VFX gallery is the only source of reel content; journal media is not used.
const sources = new Map(data.projects.filter(project => project.video && !editConfig.excludedProjects.includes(project.id)).map(project => [project.id, project]));
const edits = inspect ? [...sources.keys()].map(id => ({ id, start: 0 })) : editConfig.clips;
if (edits.length !== sources.size || new Set(edits.map(edit => edit.id)).size !== sources.size) throw new Error('The edit must include every eligible gallery video exactly once.');
const clips = [];
let offset = 0;
const normalize = size => `scale=${size}:force_original_aspect_ratio=decrease,pad=${size}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=24:eof_action=pass,tpad=stop_mode=clone:stop_duration=0.25,format=yuv420p`;

for (const [index, edit] of edits.entries()) {
  const source = sources.get(edit.id);
  if (!source || !/^[-a-z0-9]+$/.test(source.id) || !source.video.startsWith('/assets/videos/vfx/')) throw new Error(`Video is outside the VFX gallery: ${edit.id}`);
  const file = path.join(root, source.video.slice(1));
  const probe = spawnSync(ffmpeg, ['-hide_banner', '-i', file], { encoding: 'utf8' });
  if (probe.error) throw probe.error;
  const time = /Duration: (\d+):(\d+):(\d+\.\d+)/.exec(probe.stderr);
  if (!time) throw new Error(`Cannot read video duration: ${source.video}`);
  const measuredDuration = Number(time[1]) * 3600 + Number(time[2]) * 60 + Number(time[3]);
  const duration = Math.round(source.duration * 24) / 24;
  if (!Number.isFinite(duration) || duration <= 0 || Math.abs(duration - measuredDuration) > 0.03) throw new Error(`Gallery duration differs from the video: ${source.id}`);
  const hasAudio = /Stream.*Audio:/.test(probe.stderr);
  if (inspect) {
    const count = duration > 15 ? 18 : 6;
    run(['-i', file, '-vf', `fps=${count}/${duration},scale=320:180:force_original_aspect_ratio=decrease,pad=320:200:(ow-iw)/2:0,drawtext=fontfile='C\\:/Windows/Fonts/arial.ttf':text='%{pts\\:hms}':fontcolor=white:fontsize=13:x=8:y=182,tile=6x${Math.ceil(count / 6)}`, '-frames:v', '1', path.join(work, `${source.id}.jpg`)]);
    console.log(`${source.title}: ${duration}s, audio=${hasAudio}`);
    continue;
  }
  const highlightDuration = Math.min(3, duration);
  if (!Number.isFinite(edit.start) || edit.start < 0 || edit.start + highlightDuration > duration + 0.01) throw new Error(`Highlight is out of bounds: ${source.id}`);
  const id = `${String(index + 1).padStart(2, '0')}-${source.id}`;
  run(['-ss', String(edit.start), '-i', file, '-t', String(highlightDuration), '-an', '-vf', normalize('1280:720'), '-c:v', 'libx264', '-preset', 'fast', '-crf', '22', '-threads', '4', '-movflags', '+faststart', path.join(videoDir, `${id}.mp4`)]);
  run(['-ss', String(edit.start + highlightDuration / 2), '-i', file, '-frames:v', '1', '-vf', normalize('1280:720'), '-q:v', '3', path.join(imageDir, `${id}.jpg`)]);
  clips.push({ id, projectId: source.id, title: source.title, project: source.type, projectUrl: `/vfx/${source.id}/`, source: source.video, start: edit.start, duration: highlightDuration, fullDuration: duration, offset: Number(offset.toFixed(6)), hasAudio, src: `/assets/videos/reels/${id}.mp4`, poster: `reels/${id}.jpg` });
  offset += duration;
  console.log(`Highlight ${index + 1}/${edits.length}: ${source.title}`);
}

if (!inspect) {
  // Encode audio once after concatenation, retaining original sound and silent intervals.
  const filters = clips.flatMap((clip, i) => [
    `[${i}:v:0]${normalize('1920:1080')},trim=duration=${clip.fullDuration},setpts=PTS-STARTPTS[v${i}]`,
    `${clip.hasAudio ? `[${i}:a:0]aresample=48000` : 'anullsrc=r=48000:cl=stereo'},aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo,apad,atrim=duration=${clip.fullDuration},asetpts=PTS-STARTPTS[a${i}]`
  ]);
  filters.push(clips.map((_, i) => `[v${i}][a${i}]`).join('') + `concat=n=${clips.length}:v=1:a=1[video][audio]`);
  const reelFile = path.join(videoDir, 'vfx-reel.mp4');
  run([...clips.flatMap(clip => ['-threads', '2', '-i', path.join(root, clip.source.slice(1))]), '-filter_complex_threads', '1', '-filter_complex', filters.join(';'), '-map', '[video]', '-map', '[audio]', '-c:v', 'libx264', '-preset', 'fast', '-crf', '22', '-threads', '4', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', reelFile]);
  if (fs.statSync(reelFile).size >= 95 * 1024 * 1024) throw new Error('Reel must fit the GitHub Pages file size limit.');
  fs.copyFileSync(path.join(imageDir, `${clips[0].id}.jpg`), path.join(imageDir, 'vfx-reel.jpg'));
  const sourceDataHash = createHash('sha256').update(fs.readFileSync(path.join(root, 'vfx-data.js'), 'utf8').replace(/\r\n/g, '\n')).digest('hex');
  const reels = { sourceDataHash, categories: [{ id: 'vfx', title: 'VFX', src: '/assets/videos/reels/vfx-reel.mp4', poster: 'reels/vfx-reel.jpg', duration: Number(offset.toFixed(6)) }], clips };
  fs.writeFileSync(path.join(root, 'reel-data.js'), `/* Generated from the VFX gallery by prepare-reels.cjs. */\nwindow.PORTFOLIO.reels = ${JSON.stringify(reels, null, 2)};\n`);
  console.log(`VFX reel ready: ${offset.toFixed(3)}s, ${(fs.statSync(reelFile).size / 1024 / 1024).toFixed(1)} MB`);
}
