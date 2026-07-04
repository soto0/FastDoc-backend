import Groq from 'groq-sdk';

const clients = new Map<string, Groq>();

export const groqClient = (apiKey: string | undefined): Groq => {
    const cacheKey = apiKey ?? '';
    const cachedClient = clients.get(cacheKey);

    if (cachedClient) return cachedClient;

    const client = new Groq({ apiKey });
    clients.set(cacheKey, client);

    return client;
};
