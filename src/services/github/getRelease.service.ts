import { fetchRelease } from '@/utils/fetchRelease';

interface IGetReleaseParams {
    owner: string;
    repo: string;
    version: string;
}

export const getRelease = async ({ owner, repo, version }: IGetReleaseParams): Promise<string> => {
    try {
        return await fetchRelease({ owner, repo, tag: `v${version}` });
    } catch {
        return fetchRelease({ owner, repo, tag: version });
    }
};
