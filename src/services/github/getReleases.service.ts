import githubClient from '@/config/githubClient';

interface GetReleasesParams {
    repo: string;
    owner: string;
}

export const getReleases = async (params: GetReleasesParams) => {
    const response = await githubClient.request('GET /repos/{owner}/{repo}/releases', { owner: params.owner, repo: params.repo });
    return response.data.map((release) => ({ id: release.id, tag: release.tag_name, name: release.name }));
};
