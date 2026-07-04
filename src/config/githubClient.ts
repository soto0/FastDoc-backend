import { Octokit } from 'octokit';

const clients = new Map<string, Octokit>();

export const githubClient = (auth: string | undefined): Octokit => {
    const cacheKey = auth ?? '';
    const cachedClient = clients.get(cacheKey);

    if (cachedClient) return cachedClient;

    const client = new Octokit({ auth });
    clients.set(cacheKey, client);

    return client;
};
