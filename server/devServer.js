const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0';
const baseDir = path.resolve(__dirname, '..', 'public');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

function resolvePath(urlPath) {
  const safeSuffix = decodeURI(urlPath.split('?')[0]);
  let relativePath = path.normalize(safeSuffix).replace(/^\/+/, '');
  if (relativePath === '') {
    relativePath = 'index.html';
  }
  if (relativePath.endsWith('/')) {
    relativePath += 'index.html';
  }
  const absolutePath = path.join(baseDir, relativePath);
  if (!absolutePath.startsWith(baseDir)) {
    return null;
  }
  return absolutePath;
}

const server = http.createServer((req, res) => {
  const filePath = resolvePath(req.url || '/');
  if (!filePath) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    const stream = fs.createReadStream(filePath);
    stream.on('open', () => {
      res.writeHead(200, { 'Content-Type': contentType });
      stream.pipe(res);
    });
    stream.on('error', () => {
      res.writeHead(500);
      res.end('Internal Server Error');
    });
  });
});

server.listen(port, host, () => {
  const url = `http://localhost:${port}`;
  console.log(`Evorise dev server running at ${url}`);
  console.log('Press Ctrl+C to stop.');
});
