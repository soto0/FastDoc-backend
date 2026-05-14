import type { IRepos } from '@/types/IRepos';
import githubClient from '@/config/githubClient';

interface IReposResponse {
    data: { items: IRepos[] };
}

export const getRepos = async (query: string): Promise<IRepos[]> => {
    const response: IReposResponse = await githubClient.request('GET /search/repositories?q={q}&per_page=15&page=1&sort=stars', { q: query });
    return response.data.items;
};
