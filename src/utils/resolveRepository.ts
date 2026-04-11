import type { INpmLibrary } from '@/types/INpmLibrary';
import { AppError } from './appError';

const GITHUB_REPO_URL_REGEX = /^git\+|\.git$/gi;

export const resolveRepositoryURL = (repository: INpmLibrary['repository']): string => {
    if (repository == null) {
        throw new AppError(400, 'Не удалось получить репозиторий', 'RESOLVE_REPOSITORY_ERROR');
    }

    const url = repository.url.replace(GITHUB_REPO_URL_REGEX, '');
    return new URL(url).pathname.split('/').slice(1, 3).join('/');
};
