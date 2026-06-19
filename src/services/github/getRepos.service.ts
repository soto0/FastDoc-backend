import type { IRepos } from '@/types/IRepos';
import githubClient from '@/config/githubClient';

interface ReposResponse {
    data: { items: { id: number; name: string; owner: { login: string } }[] };
}

export const getRepos = async (query: string): Promise<IRepos[]> => {
    const response: ReposResponse = await githubClient.request('GET /search/repositories?q={q}&per_page=15&page=1&sort=stars', { q: query });
    return response.data.items.map((item) => ({ id: item.id, repo: item.name, owner: item.owner.login }));
};
