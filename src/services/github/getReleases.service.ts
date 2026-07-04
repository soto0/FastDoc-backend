import type { AppBindings } from '@/types/AppEnv';
import type { IReleases, IReleasesPage } from '@/types/IReleases';
import { githubClient } from '@/config/githubClient';
import { getRuntimeEnv } from '@/config/runtimeEnv';

interface GetReleasesParams {
    repo: string;
    owner: string;
    page: number;
}

const GITHUB_RELEASES_PER_PAGE = 20;
const HAS_NEXT_PAGE_REGEX = /\brel="next"/;

export const getReleases = async (params: GetReleasesParams, env?: AppBindings): Promise<IReleasesPage> => {
    const response = await githubClient(getRuntimeEnv(env, 'GITHUB_TOKEN')).request('GET /repos/{owner}/{repo}/releases', {
        owner: params.owner,
        repo: params.repo,
        page: params.page,
        per_page: GITHUB_RELEASES_PER_PAGE
    });

    const stableReleases = response.data.filter((release) => !release.prerelease);

    const releases = stableReleases.map((release) => ({
        id: release.id,
        tag: release.tag_name,
        name: release.name ?? release.tag_name
    })) as IReleases[];

    return {
        releases,
        hasMore: HAS_NEXT_PAGE_REGEX.test(response.headers.link ?? '')
    };
};
