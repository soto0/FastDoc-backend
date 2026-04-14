import type { INpmLibrary } from '@/types/INpmLibrary';
import { AppError } from './appError';

const GITHUB_REPO_URL_REGEX = /^git\+|\.git$/gi;

interface IResolveRepository {
    owner: string;
    repo: string;
}

export const resolveRepository = (repository: INpmLibrary['repository']): IResolveRepository => {
    if (repository == null || repository.url == null) {
        throw new AppError(400, 'Не удалось получить репозиторий', 'RESOLVE_REPOSITORY_ERROR');
    }

    const url = repository.url.replace(GITHUB_REPO_URL_REGEX, '');
    const { pathname } = new URL(url);

    const [owner, repo] = pathname.split('/').slice(1);
    return { owner, repo };
};
