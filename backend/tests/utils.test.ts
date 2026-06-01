import { describe, test, expect } from 'vitest';
import { parseJsonBody } from '../src/utils/bodyParser.js';
import { hashPassword } from '../src/utils/hashPassword.js';
import { EventEmitter } from 'events';
import { IncomingMessage } from 'http';

describe('Utility Functions', () => {

    describe('parseJsonBody', () => {
        test('should successfully parse valid JSON stream', async () => {
            const mockReq = new EventEmitter() as unknown as IncomingMessage;
            
            const promise = parseJsonBody(mockReq);
            
            mockReq.emit('data', Buffer.from('{"name":'));
            mockReq.emit('data', Buffer.from('"Test"}'));
            mockReq.emit('end');

            const result = await promise;
            expect(result).toEqual({ name: 'Test' });
        });

        test('should return empty object for empty body', async () => {
            const mockReq = new EventEmitter() as unknown as IncomingMessage;
            const promise = parseJsonBody(mockReq);
            mockReq.emit('end');

            const result = await promise;
            expect(result).toEqual({});
        });
    });

    describe('hashPassword', () => {
        test('should hash a password string', async () => {
            const hash = await hashPassword('myPassword123');
            expect(hash).toBeDefined();
            expect(hash).not.toBe('myPassword123');
        });
    });
});