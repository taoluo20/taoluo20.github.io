const fs = require('node:fs');
const path = require('node:path');
const { generatePages } = require('./generate-pages.cjs');
const generatedFiles = generatePages();
const output = path.resolve(__dirname, 'dist');
if (path.dirname(output) !== path.resolve(__dirname) || path.basename(output) !== 'dist') throw new Error('Build output must be this website’s dist directory.');
if (fs.existsSync(output) && fs.lstatSync(output).isSymbolicLink()) throw new Error('Build output must not be a symbolic link or junction.');
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
for (const file of ['index.html', 'styles.css', 'blog.css', 'accents.css', 'footer.css', 'app.js', 'site-data.js', 'site-info.json', '.nojekyll', 'generated-pages.json', ...generatedFiles]) {
  const target = path.join(output, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(path.join(__dirname, file), target);
}
fs.cpSync(path.join(__dirname, 'assets'), path.join(output, 'assets'), { recursive: true, filter: file => !file.endsWith('contact-sheet.png') });
console.log('Static website ready in dist/.');
