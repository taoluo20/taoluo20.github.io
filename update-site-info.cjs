const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const root = __dirname;
const changes = execFileSync('git', ['status', '--porcelain', '--untracked-files=normal', '--', '.'], { cwd: root, encoding: 'utf8' }).trim();
if (!changes) {
  console.log('Site information unchanged; no empty update commit.');
} else {
  fs.writeFileSync(path.join(root, 'site-info.json'), JSON.stringify({ updatedAt: new Date().toISOString() }, null, 2) + '\n');
  console.log('Website update date refreshed.');
}
