import type { AppBindings } from '@/types/AppEnv';
import type { IRepos } from '@/types/IRepos';
import { getRepos } from '@/services/github/getRepos.service';
import { AppError } from '@/utils/appError';
import { cacheClient } from '@/utils/cacheClient';

export const searchService = cacheClient(
    async (query: string, env?: AppBindings): Promise<IRepos[]> => {
        const response = await getRepos(query, env);

        if (!response.length) throw new AppError(404, 'Репозитории не найдены', 'REPOS_NOT_FOUND');

        return response;
    },
    { ttl: 1000 * 60 * 5, keyFn: (q, _env?: AppBindings) => q.toLowerCase().trim() }
);
