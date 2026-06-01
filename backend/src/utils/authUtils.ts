import { IncomingMessage } from 'http';
import jwt, { JwtPayload } from 'jsonwebtoken'; // 1. Импортираме JwtPayload

export function authenticateUser(req: IncomingMessage): { id: number; email: string } | null {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return null;
        }

        const secret = process.env.JWT_SECRET || 'super_secret_fallback_key';

        const decoded = jwt.verify(token, secret) as JwtPayload;

        if (!decoded || typeof decoded === 'string' || !decoded.id || !decoded.email) {
            return null;
        }

        return {
            id: decoded.id,
            email: decoded.email
        };
    } catch (err) {
        return null;
    }
}