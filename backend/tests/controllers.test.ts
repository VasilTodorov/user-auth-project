import { describe, test, expect, beforeEach, vi } from 'vitest';
import { registerUser, loginUser, getCurrentUser } from '../src/controllers/authController.js';
import { IncomingMessage, ServerResponse } from 'http';
import * as authRepository from '../src/repositories/authRepository.js';
import * as validation from '../src/utils/validation.js';
import { EventEmitter } from 'events';

// Маскираме репозиторито и валидациите, за да не пипат реалната база
vi.mock('../src/repositories/authRepository.js');
vi.mock('../src/utils/validation.js');

describe('Auth Controller (Register & Login)', () => {
    let mockReq: any;
    let mockRes: any;

    beforeEach(() => {
        // Симулираме HTTP Request като EventEmitter (за body parser-а)
        mockReq = new EventEmitter() as unknown as IncomingMessage;
        
        // Симулираме HTTP Response
        mockRes = {
            writeHead: vi.fn(),
            end: vi.fn()
        } as unknown as ServerResponse;

        vi.clearAllMocks();
    });

    // 1. ТЕСТ ЗА УСПЕШНА РЕГИСТРАЦИЯ
    test('registerUser should return 201 on successful registration', async () => {
        // Симулираме, че валидациите не откриват грешки
        vi.spyOn(validation, 'validateCaptcha').mockReturnValue(null);
        vi.spyOn(validation, 'validateRegistrateUserInput').mockReturnValue([]);
        
        // Симулираме, че записът в базата данни преминава успешно
        vi.spyOn(authRepository, 'insertUser').mockResolvedValue(undefined);

        const promise = registerUser(mockReq, mockRes);

        // Подаваме тестови данни през стрийма
        mockReq.emit('data', Buffer.from(JSON.stringify({
            email: 'new@example.com',
            full_name: 'Alex Ivanov',
            password: 'securePassword123',
            captchaAnswer: '5',
            captchaToken: 'mockToken'
        })));
        mockReq.emit('end');

        await promise;

        // Очакваме статус 201 Created
        expect(mockRes.writeHead).toHaveBeenCalledWith(201, expect.any(Object));
        expect(mockRes.end).toHaveBeenCalledWith(expect.stringContaining('User regisrated successufly'));
    });

    // 2. ТЕСТ ЗА НЕУСПЕШЕН ЛОГИН (ГРЕШНА ПАРОЛА ИЛИ ИМЕЙЛ)
    test('loginUser should return 401 if user does not exist', async () => {
        vi.spyOn(validation, 'validateLoginUserInput').mockReturnValue([]);
        
        // Симулираме, че базата данни не намира такъв имейл (връща null)
        vi.spyOn(authRepository, 'getUserByEmail').mockResolvedValue(null);

        const promise = loginUser(mockReq, mockRes);

        mockReq.emit('data', Buffer.from(JSON.stringify({
            email: 'missing@example.com',
            password: 'anyPassword'
        })));
        mockReq.emit('end');

        await promise;

        // Очакваме статус 401 Unauthorized
        expect(mockRes.writeHead).toHaveBeenCalledWith(401, expect.any(Object));
        expect(mockRes.end).toHaveBeenCalledWith(expect.stringContaining('Invalid email or password'));
    });

    // 3. ТЕСТ ЗА /api/captcha (Генериране на CAPTCHA)
    test('getCaptcha should return 200 and a fresh captcha question with token', async () => {
        const { getCaptcha } = await import('../src/controllers/captchaController.js');

        const promise = getCaptcha(mockReq, mockRes);
        // За GET заявка няма нужда да подаваме body данни през стрийма, просто затваряме
        mockReq.emit('end'); 

        await promise;

        // Очакваме статус 200 OK
        expect(mockRes.writeHead).toHaveBeenCalledWith(200, expect.any(Object));
        // Проверяваме дали връща въпрос и токен в JSON-а
        expect(mockRes.end).toHaveBeenCalledWith(expect.stringContaining('question'));
        expect(mockRes.end).toHaveBeenCalledWith(expect.stringContaining('captchaToken'));
    });

    // 4. ТЕСТ ЗА /api/user/me (Вземане на текуща сесия)
    test('getCurrentUser should return 200 and user data if found', async () => {
        // Симулираме, че репозиторито намира потребителя по ID
        vi.spyOn(authRepository, 'findUserById').mockResolvedValue({
            id: 1,
            full_name: 'John Doe',
            email: 'john@example.com'
        });

        // Викаме директно контролера, както прави рутерът ни
        await getCurrentUser(mockRes, 1);

        expect(mockRes.writeHead).toHaveBeenCalledWith(200, expect.any(Object));
        expect(mockRes.end).toHaveBeenCalledWith(expect.stringContaining('John Doe'));
    });

    // 5. ТЕСТ ЗА /api/user/update (Обновяване на профила)
    test('updateUser should return 200 on successful name change', async () => {
        const { updateUser } = await import('../src/controllers/userController.js');
        
        // Симулираме, че валидацията за ъпдейт минава без грешки
        vi.spyOn(validation, 'validateUpdateUserInput').mockReturnValue([]);
        
        // Симулираме успешна SQL заявка за промяна на името
        vi.spyOn(authRepository, 'updateFullName').mockResolvedValue({ id: 1, full_name: 'New Name' } as any);

        const promise = updateUser(mockReq, mockRes, 1);

        // Подаваме новото име в тялото на заявката
        mockReq.emit('data', Buffer.from(JSON.stringify({
            full_name: 'New Name'
        })));
        mockReq.emit('end');

        await promise;

        expect(mockRes.writeHead).toHaveBeenCalledWith(200, expect.any(Object));
        expect(mockRes.end).toHaveBeenCalledWith(expect.stringContaining('User updated successfully'));
    });
});