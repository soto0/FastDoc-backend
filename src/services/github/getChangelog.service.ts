import type { AppBindings } from '@/types/AppEnv';
import { githubClient } from '@/config/githubClient';
import { getRuntimeEnv } from '@/config/runtimeEnv';

interface GetChangelogParams {
    repo: string;
    owner: string;
    tag: string;
}

export const getChangelog = async (params: GetChangelogParams, env?: AppBindings): Promise<string | null | undefined> => {
    const response = await githubClient(getRuntimeEnv(env, 'GITHUB_TOKEN')).request('GET /repos/{owner}/{repo}/releases/tags/{tag}', {
        ...params
    });

    return response.data.body;
};
