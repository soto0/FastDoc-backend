import { GoogleGenAI } from '@google/genai';

const clients = new Map<string, GoogleGenAI>();

export const geminiClient = (apiKey: string | undefined): GoogleGenAI => {
    const cacheKey = apiKey ?? '';
    const cachedClient = clients.get(cacheKey);

    if (cachedClient) return cachedClient;

    const client = new GoogleGenAI({ apiKey });
    clients.set(cacheKey, client);

    return client;
};
