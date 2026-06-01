import { describe, test, expect, vi, type Mock } from 'vitest';
import { 
    validateRegistrateUserInput, 
    validateLoginUserInput, 
    validateUpdateUserInput,
    validateCaptcha 
} from '../src/utils/validation.js';
import jwt from 'jsonwebtoken';

vi.mock('jsonwebtoken');

describe('Validation Utilities', () => {

    describe('validateRegistrateUserInput', () => {
        test('should catch missing or invalid fields', () => {
            const errors = validateRegistrateUserInput({ email: 'bad-email', full_name: '', password: '123' });
            expect(errors).toContain('Invalid email format');
            expect(errors).toContain('full_name is required');
            expect(errors).toContain('Password must be at least 8 characters');
        });

        test('should pass valid data', () => {
            const errors = validateRegistrateUserInput({ 
                email: 'test@example.com', 
                full_name: 'John Doe', 
                password: 'password123' 
            });
            expect(errors.length).toBe(0);
        });
    });

    describe('validateLoginUserInput', () => {
        test('should report missing fields', () => {
            const errors = validateLoginUserInput({});
            expect(errors).toContain('email is required');
            expect(errors).toContain('password is required');
        });
    });

    describe('validateUpdateUserInput', () => {
        test('should reject completely empty updates', () => {
            const errors = validateUpdateUserInput({});
            expect(errors).toContain('At least one field (full_name or password) must be provided to update');
        });
    });

    describe('validateCaptcha', () => {
        test('should fail if missing inputs', () => {
            const err = validateCaptcha(undefined, undefined);
            expect(err).toBe('CAPTCHA solution and token are required');
        });

        test('should return error for wrong answers', () => {
            (jwt.verify as jest.Mock).mockReturnValue({ answer: 10 });
            const err = validateCaptcha(5, 'mockToken');
            expect(err).toBe('Incorrect CAPTCHA answer. Try again.');
        });

        test('should pass for correct string matched answer', () => {
            (jwt.verify as jest.Mock).mockReturnValue({ answer: 10 });
            const err = validateCaptcha('10', 'mockToken');
            expect(err).toBeNull();
        });
    });
});