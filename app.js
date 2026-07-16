import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
const PORT = 3000;
const DATA_FILE = path.join(process.cwd(), 'data.json');
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
};
const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/api/data') {
        fs.readFile(DATA_FILE, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: 'Failed to read data.json' }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
        });
        return;
    }
    if (req.method === 'POST' && req.url === '/api/cell') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const { row, col, value } = JSON.parse(body);
                fs.readFile(DATA_FILE, 'utf8', (err, data) => {
                    if (err) {
                        res.writeHead(500);
                        res.end(JSON.stringify({ error: 'Failed to read data.json' }));
                        return;
                    }
                    const jsonData = JSON.parse(data);
                    jsonData[`${row},${col}`] = value;
                    fs.writeFile(DATA_FILE, JSON.stringify(jsonData, null, 2), 'utf8', (err) => {
                        if (err) {
                            res.writeHead(500);
                            res.end(JSON.stringify({ error: 'Failed to write data.json' }));
                            return;
                        }
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true }));
                    });
                });
            }
            catch (error) {
                res.writeHead(400);
                res.end(JSON.stringify({ error: 'Invalid request body' }));
            }
        });
        return;
    }
    // Serve static files
    let filePath = '.' + (req.url === '/' ? '/index.html' : req.url);
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found', 'utf-8');
            }
            else {
                res.writeHead(500);
                res.end('Sorry, check with the site admin for error: ' + err.code + ' ..\n');
            }
        }
        else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
//# sourceMappingURL=app.js.map