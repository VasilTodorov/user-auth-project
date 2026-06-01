import { IncomingMessage, ServerResponse } from 'http';
import { loginUser, registerUser } from './controllers/authController.js';
import { updateUser } from './controllers/userController.js';
import { getCaptcha } from './controllers/captchaController.js';

export async function handleRequests(req: IncomingMessage, res: ServerResponse) {
    const { method, url } = req;

    if (url === '/api/register' && method === 'POST') {
        return await registerUser(req, res);
    }

    if (url === '/api/login' && method === 'POST') {
        return await loginUser(req, res);
    }

    if (url === '/api/logout' && method === 'POST') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'Logout successful. Please clear token from local storage.' }));
    }

    if (url === '/api/user/update' && method === 'PUT') {
        return await updateUser(req, res);
    }

    if (url === '/api/captcha' && method === 'GET') {
        return getCaptcha(req, res);
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ message: 'Route not found' }));
}