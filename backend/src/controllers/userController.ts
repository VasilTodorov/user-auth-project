import { IncomingMessage, ServerResponse } from 'http';
import { parseJsonBody } from '../utils/bodyParser.js';
import { authenticateUser } from '../utils/authUtils.js';
import { updateFullName, updatePassword } from '../repositories/authRepository.js';
import { hashPassword } from '../utils/hashPassword.js';
import { validateUpdateUserInput } from '../utils/validation.js'

export async function updateUser(req: IncomingMessage, res: ServerResponse) {
    try {
        const user = authenticateUser(req);
        if (!user) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: 'Unauthorized. Invalid or missing token.' }));
        }

        const body = await parseJsonBody(req);
        const { full_name, password } = body;

        const errors = validateUpdateUserInput({ full_name, password });
        if (errors.length > 0) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: 'Validation failed', errors }));
        }

        if (full_name) {
            await updateFullName(user.id, full_name); 
        }

        if (password) {
            const newHash = await hashPassword(password);
            await updatePassword(user.id, newHash); 
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'User updated successfully' }));

    } catch (err) {
        console.error('Error in updateUser:', err);
        throw err;
    }
}