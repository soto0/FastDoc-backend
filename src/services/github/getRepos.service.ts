import type { AppBindings } from '@/types/AppEnv';
import type { IRepos } from '@/types/IRepos';
import { githubClient } from '@/config/githubClient';
import { getRuntimeEnv } from '@/config/runtimeEnv';

interface ReposResponse {
    data: { items: { id: number; name: string; owner: { login: string } }[] };
}

export const getRepos = async (query: string, env?: AppBindings): Promise<IRepos[]> => {
    const response: ReposResponse = await githubClient(getRuntimeEnv(env, 'GITHUB_TOKEN')).request(
        'GET /search/repositories?q={q}&per_page=15&page=1&sort=stars',
        { q: query }
    );

    return response.data.items.map((item) => ({ id: item.id, repo: item.name, owner: item.owner.login }));
};
