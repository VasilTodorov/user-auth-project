import { describe, test, expect, beforeEach, vi, type Mock } from 'vitest';
import { authenticateToken } from '../src/utils/auth.js';
import { IncomingMessage, ServerResponse } from 'http';
import jwt from 'jsonwebtoken';

vi.mock('jsonwebtoken'); 
describe('Auth Middleware', () => {
    let mockReq: Partial<IncomingMessage>;
    let mockRes: Partial<ServerResponse>;
    let nextMock: any; 

    beforeEach(() => {
        mockReq = { headers: {} };
        mockRes = {
            writeHead: vi.fn() as any,
            end: vi.fn() as any
        };
        nextMock = vi.fn().mockResolvedValue(undefined);
    });

    test('should return 401 if authorization header is missing', () => {
        authenticateToken(mockReq as IncomingMessage, mockRes as ServerResponse, nextMock);
        expect(mockRes.writeHead).toHaveBeenCalledWith(401, expect.any(Object));
        expect(nextMock).not.toHaveBeenCalled();
    });

    test('should call next with id if token is valid', () => {
        mockReq.headers!['authorization'] = 'Bearer valid_token';
        (jwt.verify as Mock).mockReturnValue({ id: 42 }); // <-- Използваме Mock от vitest

        authenticateToken(mockReq as IncomingMessage, mockRes as ServerResponse, nextMock);
        expect(nextMock).toHaveBeenCalledWith(42);
    });

    test('should return 401 if token is expired or altered', () => {
        mockReq.headers!['authorization'] = 'Bearer broken_token';
        (jwt.verify as Mock).mockImplementation(() => {
            throw new Error('jwt expired');
        });

        authenticateToken(mockReq as IncomingMessage, mockRes as ServerResponse, nextMock);
        expect(mockRes.writeHead).toHaveBeenCalledWith(401, expect.any(Object));
    });
});