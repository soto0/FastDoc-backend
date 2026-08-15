import OpenAI from 'openai';

const clients = new Map<string, OpenAI>();

export const openaiClient = (apiKey: string | undefined): OpenAI => {
    const cacheKey = apiKey ?? '';
    const cachedClient = clients.get(cacheKey);

    if (cachedClient) return cachedClient;

    const client = new OpenAI({ apiKey });
    clients.set(cacheKey, client);

    return client;
};
