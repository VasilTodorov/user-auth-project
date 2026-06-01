import fs from 'fs';
import path from 'path';
import { IncomingMessage, ServerResponse } from 'http';

export function serveStaticFiles(req: IncomingMessage, res: ServerResponse): boolean {
    if (req.url?.startsWith('/api')) {
        return false;
    }

    const reqUrl = req.url || '/';
    let filePath = '';

    if (reqUrl === '/app.js' || reqUrl === '/app.js.map') {
        filePath = path.join(process.cwd(), 'dist', 'frontend', 'public', reqUrl);
    } else if (reqUrl === '/styles.css') {
        filePath = path.join(process.cwd(), 'frontend', 'public', 'styles.css');
    } else {
        filePath = path.join(process.cwd(), 'frontend', 'public', 'index.html');
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath);
        let contentType = 'text/html';
        
        if (ext === '.css') contentType = 'text/css';
        if (ext === '.js') contentType = 'application/javascript';

        res.writeHead(200, { 'Content-Type': contentType });
        fs.createReadStream(filePath).pipe(res);
        return true; 
    }

    return false;
}