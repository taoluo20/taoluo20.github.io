const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const root = __dirname;
const changes = execFileSync('git', ['status', '--porcelain', '--untracked-files=normal', '--', '.'], { cwd: root, encoding: 'utf8' }).trim();
if (!changes) {
  console.log('Site information unchanged; no empty update commit.');
} else {
  const { version } = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  fs.writeFileSync(path.join(root, 'site-info.json'), JSON.stringify({ version, updatedAt: new Date().toISOString() }, null, 2) + '\n');
  console.log('Website version and update date refreshed.');
}
