const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = __dirname;
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'site-data.js'), 'utf8'), context);
const data = context.window.PORTFOLIO;
assert.equal(data.name, 'Tao Luo');
assert.ok(['wip', 'full'].includes(data.release), 'release must be wip or full');
assert.equal(data.socials.length, 5);
for (const file of ['index.html', 'styles.css', 'app.js', '.nojekyll', 'assets/social-icons.svg']) assert.ok(fs.existsSync(path.join(root, file)), `Missing ${file}`);
for (const entry of [...data.projects, ...data.photographs, ...data.posts]) {
  for (const image of [entry.image, entry.secondary].filter(Boolean)) assert.ok(fs.existsSync(path.join(root, 'assets/images', image)), `Missing image: ${image}`);
}
for (const social of data.socials) if (social.url) assert.equal(new URL(social.url).protocol, 'https:');
console.log(`Site check passed (${data.release} release, five social links, all local assets present).`);
