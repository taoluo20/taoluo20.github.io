const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const port = Number(process.env.PORT || 5174);
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8' };
function sendFile(req, res, file, status = 200) {
  res.writeHead(status, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
  if (req.method === 'HEAD') { res.end(); return; }
  fs.createReadStream(file).pipe(res);
}
function notFound(req, res) {
  const file = path.join(root, '404.html');
  if (fs.existsSync(file)) sendFile(req, res, file, 404);
  else { res.writeHead(404); res.end('Not found'); }
}
const server = http.createServer((req, res) => {
  let pathname;
  let search;
  try { const url = new URL(req.url, 'http://localhost'); pathname = decodeURIComponent(url.pathname); search = url.search; }
  catch { res.writeHead(400); res.end('Bad request'); return; }
  const file = path.resolve(root, '.' + pathname);
  if ((file !== root && !file.startsWith(root + path.sep)) || pathname.split('/').some(part => part.startsWith('.'))) {
    res.writeHead(403); res.end('Forbidden'); return;
  }
  fs.stat(file, (error, stat) => {
    if (error) { notFound(req, res); return; }
    if (stat.isDirectory()) {
      if (!pathname.endsWith('/')) {
        res.writeHead(301, { Location: new URL(req.url, 'http://localhost').pathname + '/' + search });
        res.end(); return;
      }
      const index = path.join(file, 'index.html');
      fs.stat(index, (indexError, indexStat) => {
        if (indexError || !indexStat.isFile()) notFound(req, res);
        else sendFile(req, res, index);
      });
      return;
    }
    if (!stat.isFile()) { notFound(req, res); return; }
    sendFile(req, res, file);
  });
});
server.listen(port, '127.0.0.1', () => console.log(`Tao Luo portfolio\nLocal: http://127.0.0.1:${port}`));
