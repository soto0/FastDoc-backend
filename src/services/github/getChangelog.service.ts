import githubClient from '@/config/githubClient';

interface GetChangelogParams {
    repo: string;
    owner: string;
    tag: string;
}

export const getChangelog = async (params: GetChangelogParams): Promise<string | null | undefined> => {
    const response = await githubClient.request('GET /repos/{owner}/{repo}/releases/tags/{tag}', { ...params });
    return response.data.body;
};
