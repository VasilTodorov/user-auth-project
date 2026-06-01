import http from 'http';
import 'dotenv/config';
import { initDatabase } from './config/db.js';     
import { handleRequests } from './router.js'; 
import { serveStaticFiles } from './utils/staticServer.js';      

export async function startServer() {
    try {
        await initDatabase();

        const server = http.createServer(async (req, res) => {
            try {
                if (serveStaticFiles(req, res)) {
                    return; 
                }
                
                await handleRequests(req, res); 
            } catch (err) {
                console.error('Critical error in server:', err);
                if (!res.writableEnded) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Internal Server Error' }));
                }
            }
        });

        const PORT = process.env.PORT || 3000;
        const HOST = process.env.DB_HOST || 'localhost';
        server.listen(PORT, () => {
            console.log(`Server is running on http://${HOST}:${PORT}`);
        });
    } catch (err) {
        console.error('Connection error:', err);
        process.exit(1);
    }
}

startServer();