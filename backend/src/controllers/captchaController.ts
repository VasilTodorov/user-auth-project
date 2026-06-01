import { IncomingMessage, ServerResponse } from 'http';
import jwt from 'jsonwebtoken';

const wordsEn = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

export function getCaptcha(req: IncomingMessage, res: ServerResponse) {
    try {
        const num1 = Math.floor(Math.random() * 10); 
        const num2 = Math.floor(Math.random() * 10); 
        const answer = num1 + num2;

        const word1 = wordsEn[num1];
        const word2 = wordsEn[num2];

        const templates = [
            `What is ${word1} plus ${word2}?`,
            `Calculate the sum of ${word1} and ${word2}:`,
            `How much is ${word1} + ${word2}?`
        ];
        const randomQuestion = templates[Math.floor(Math.random() * templates.length)];

        const secret = process.env.JWT_SECRET || 'super_secret_fallback_key';
        
        const captchaToken = jwt.sign({ answer: answer }, secret, { expiresIn: '3m' });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
            question: randomQuestion,
            captchaToken: captchaToken
        }));

    } catch (err) {
        console.error('Error generating captcha:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'Internal Server Error' }));
    }
}