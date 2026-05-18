import { getReleases } from '@/services/github/getReleases.service';
import { AppError } from '@/utils/appError';
import { cacheClient } from '@/utils/cacheClient';

interface ReleasesServiceParams {
    repo: string;
    owner: string;
}

export const releasesService = cacheClient(
    async (params: ReleasesServiceParams) => {
        const response = await getReleases(params);

        if (!response.length) throw new AppError(404, 'Версии репозитория не найдены', 'REPOS_NOT_FOUND');

        return response;
    },
    { ttl: 1000 * 60 * 5, keyFn: ({ repo, owner }) => `${repo}/${owner}`.toLowerCase().trim() }
);
