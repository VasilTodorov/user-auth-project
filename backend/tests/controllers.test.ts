import { describe, test, expect, beforeEach, vi } from 'vitest';
import { registerUser, loginUser, getCurrentUser } from '../src/controllers/authController.js';
import { IncomingMessage, ServerResponse } from 'http';
import * as authRepository from '../src/repositories/authRepository.js';
import * as validation from '../src/utils/validation.js';
import { EventEmitter } from 'events';

vi.mock('../src/repositories/authRepository.js');
vi.mock('../src/utils/validation.js');

describe('Auth Controller (Register & Login)', () => {
    let mockReq: any;
    let mockRes: any;

    beforeEach(() => {
        mockReq = new EventEmitter() as unknown as IncomingMessage;
        
        mockRes = {
            writeHead: vi.fn(),
            end: vi.fn()
        } as unknown as ServerResponse;

        vi.clearAllMocks();
    });

    test('registerUser should return 201 on successful registration', async () => {
        vi.spyOn(validation, 'validateCaptcha').mockReturnValue(null);
        vi.spyOn(validation, 'validateRegistrateUserInput').mockReturnValue([]);
        
        vi.spyOn(authRepository, 'insertUser').mockResolvedValue(undefined);

        const promise = registerUser(mockReq, mockRes);

        mockReq.emit('data', Buffer.from(JSON.stringify({
            email: 'new@example.com',
            full_name: 'Alex Ivanov',
            password: 'securePassword123',
            captchaAnswer: '5',
            captchaToken: 'mockToken'
        })));
        mockReq.emit('end');

        await promise;

        expect(mockRes.writeHead).toHaveBeenCalledWith(201, expect.any(Object));
        expect(mockRes.end).toHaveBeenCalledWith(expect.stringContaining('User regisrated successufly'));
    });

    test('loginUser should return 401 if user does not exist', async () => {
        vi.spyOn(validation, 'validateLoginUserInput').mockReturnValue([]);
        
        vi.spyOn(authRepository, 'getUserByEmail').mockResolvedValue(null);

        const promise = loginUser(mockReq, mockRes);

        mockReq.emit('data', Buffer.from(JSON.stringify({
            email: 'missing@example.com',
            password: 'anyPassword'
        })));
        mockReq.emit('end');

        await promise;

        expect(mockRes.writeHead).toHaveBeenCalledWith(401, expect.any(Object));
        expect(mockRes.end).toHaveBeenCalledWith(expect.stringContaining('Invalid email or password'));
    });

    test('getCaptcha should return 200 and a fresh captcha question with token', async () => {
        const { getCaptcha } = await import('../src/controllers/captchaController.js');

        const promise = getCaptcha(mockReq, mockRes);
        mockReq.emit('end'); 

        await promise;

        expect(mockRes.writeHead).toHaveBeenCalledWith(200, expect.any(Object));
        expect(mockRes.end).toHaveBeenCalledWith(expect.stringContaining('question'));
        expect(mockRes.end).toHaveBeenCalledWith(expect.stringContaining('captchaToken'));
    });

    test('getCurrentUser should return 200 and user data if found', async () => {
        vi.spyOn(authRepository, 'findUserById').mockResolvedValue({
            id: 1,
            full_name: 'John Doe',
            email: 'john@example.com'
        });

        await getCurrentUser(mockRes, 1);

        expect(mockRes.writeHead).toHaveBeenCalledWith(200, expect.any(Object));
        expect(mockRes.end).toHaveBeenCalledWith(expect.stringContaining('John Doe'));
    });

    test('updateUser should return 200 on successful name change', async () => {
        const { updateUser } = await import('../src/controllers/userController.js');
        
        vi.spyOn(validation, 'validateUpdateUserInput').mockReturnValue([]);
        
        vi.spyOn(authRepository, 'updateFullName').mockResolvedValue({ id: 1, full_name: 'New Name' } as any);

        const promise = updateUser(mockReq, mockRes, 1);

        mockReq.emit('data', Buffer.from(JSON.stringify({
            full_name: 'New Name'
        })));
        mockReq.emit('end');

        await promise;

        expect(mockRes.writeHead).toHaveBeenCalledWith(200, expect.any(Object));
        expect(mockRes.end).toHaveBeenCalledWith(expect.stringContaining('User updated successfully'));
    });
});