import process from 'node:process';
import Groq from 'groq-sdk';

let _client: Groq | null = null;

export const groqClient = (): Groq => {
    if (!_client) _client = new Groq({ apiKey: process.env.GROQ_API_KEY });

    return _client;
};
