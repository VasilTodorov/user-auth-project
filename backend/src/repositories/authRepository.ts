import { query } from "../config/db.js";

export async function insertUser(full_name: string, email: string, hashPassword: string) {
    try {
        const query_text = 'INSERT INTO Users (full_name, email, password) VALUES ($1, $2, $3) RETURNING *';
        const values = [full_name, email, hashPassword];
        const result = await query(query_text, values);
        console.log('Inserted user:', result.rows[0]);
    } catch (err) {
        console.error('Error inserting user', err);
        throw err;
    }
}

export async function getUserByEmail(email: string) {
    try {
        const query_text = 'SELECT * FROM Users WHERE email = $1';
        const result = await query(query_text, [email]);
        return result.rows[0] || null; 
    } catch (err) {
        console.error('Error fetching user by email', err);
        throw err;
    }
}

export async function updateFullName(userId: number, newName: string) {
    const query_text = 'UPDATE Users SET full_name = $1 WHERE id = $2 RETURNING *';
    const result = await query(query_text, [newName, userId]);
    return result.rows[0];
}

export async function updatePassword(userId: number, newHash: string) {
    const query_text = 'UPDATE Users SET password = $1 WHERE id = $2 RETURNING *';
    const result = await query(query_text, [newHash, userId]);
    return result.rows[0];
}