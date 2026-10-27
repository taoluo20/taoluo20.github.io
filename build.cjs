const fs = require('node:fs');
const path = require('node:path');
const output = path.join(__dirname, 'dist');
fs.mkdirSync(output, { recursive: true });
for (const file of ['index.html', 'styles.css', 'blog.css', 'accents.css', 'footer.css', 'app.js', 'site-data.js', 'site-info.json', '.nojekyll']) fs.copyFileSync(path.join(__dirname, file), path.join(output, file));
fs.cpSync(path.join(__dirname, 'assets'), path.join(output, 'assets'), { recursive: true, filter: file => !file.endsWith('contact-sheet.png') });
console.log('Static website ready in dist/.');
