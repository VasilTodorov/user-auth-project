import { IncomingMessage, ServerResponse } from 'http';
import jwt, { JwtPayload } from 'jsonwebtoken';

export function authenticateToken(
    req: IncomingMessage, 
    res: ServerResponse, 
    next: (userId: number) => Promise<void>
) {
    const authHeader = req.headers['authorization'];
    
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'Access token is required' }));
    }

    try {
        const secret = process.env.JWT_SECRET || 'super_secret_fallback_key';
        
        const decoded = jwt.verify(token, secret) as JwtPayload;

        if (!decoded || typeof decoded.id !== 'number') {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: 'Invalid token payload' }));
        }

        return next(decoded.id);

    } catch (err) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'Invalid or expired session token' }));
    }
}