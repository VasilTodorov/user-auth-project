import { IncomingMessage, ServerResponse } from 'http';
import { parseJsonBody } from '../utils/bodyParser.js';
import { insertUser } from '../repositories/authRepository.js';
import { validateLoginUserInput, validateRegistrateUserInput } from '../utils/validation.js'
import { hashPassword } from '../utils/hashPassword.js';
import { getUserByEmail } from '../repositories/authRepository.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export async function registerUser(req: IncomingMessage, res: ServerResponse) {
    try {
        const body = await parseJsonBody(req);
        
        const { email, full_name, password } = body;

        const validation_error = validateRegistrateUserInput({email, full_name, password});
        if(validation_error.length > 0) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ 
                message: 'Validation failed',
                errors: validation_error
             }));
        }

        const hash_Password = await hashPassword(password)

        await insertUser(full_name, email, hash_Password);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'User regisrated successufly' }));

    } catch (err: any) {
        if (err.code === "23505") {
            res.writeHead(409, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: 'Email already exists' }));
        }

        throw err;
    }
}

export async function loginUser(req: IncomingMessage, res: ServerResponse) {
    try {
        const body = await parseJsonBody(req);
        const { email, password } = body;

        const validation_error = validateLoginUserInput({email, password});
        if (validation_error.length > 0) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify(
                { 
                    message: 'Validation failed', 
                    errors: validation_error 
                }));
        }

        const user = await getUserByEmail(email);
        if (!user) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: 'Invalid email or password' }));
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: 'Invalid email or password' }));
        }

        const secret = process.env.JWT_SECRET || 'fallback_secret';
        const token = jwt.sign(
            { id: user.id, email: user.email },
            secret
        );

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ 
            message: 'Login successful',
            token, 
            user: { id: user.id, email: user.email, full_name: user.full_name }
        }));

    } catch (err) {
        console.error('Error in login:', err);
        throw err; 
    }
}