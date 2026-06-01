import http from 'http';
import 'dotenv/config';
import { initDatabase } from './config/db.js';     
import { handleRequests } from './router.js';       

export async function startServer() {
    try {
        await initDatabase();

        const server = http.createServer(async (req, res) => {
            try {
                await handleRequests(req, res); // 2. Добавено await
            } catch (err) {
                console.error('Critical error in server:', err);
                // Ако нещо се счупи брутално, връщаме 500 на клиента, вместо да зависва заявката
                if (!res.writableEnded) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Internal Server Error' }));
                }
            }
        });

        const port = parseInt(process.env.PORT || '8080', 10);
        server.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (err) {
        console.error('Connection error:', err);
        process.exit(1);
    }
}

startServer();