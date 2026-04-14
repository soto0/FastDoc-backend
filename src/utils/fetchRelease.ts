import githubClient from '@/config/githubClient';
import { AppError } from './appError';

interface IFetchReleaseParams {
    owner: string;
    repo: string;
    tag: string;
}

export const fetchRelease = async ({ owner, repo, tag }: IFetchReleaseParams): Promise<string> => {
    const start = Date.now();

    const response = await githubClient.request('GET /repos/{owner}/{repo}/releases/tags/{tag}', { owner, repo, tag });

    // eslint-disable-next-line no-console -- debug
    console.log('[GitHub]', { owner, repo, tag, status: response.status, ms: Date.now() - start });

    if (response.data.body == null) {
        throw new AppError(404, 'Релиз найден, но не содержит информации', 'GITHUB_RELEASE_NOT_FOUND');
    }

    return response.data.body;
};
