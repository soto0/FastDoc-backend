import type { AppBindings } from '@/types/AppEnv';
import type { IReleasesPage } from '@/types/IReleases';
import { getReleases } from '@/services/github/getReleases.service';
import { cacheClient } from '@/utils/cacheClient';

interface ReleasesServiceParams {
    repo: string;
    owner: string;
    page: number;
}

export const releasesService = cacheClient(
    async (params: ReleasesServiceParams, env?: AppBindings): Promise<IReleasesPage> => getReleases(params, env),
    {
        ttl: 1000 * 60 * 5,
        keyFn: ({ repo, owner, page }, _env?: AppBindings) => `${repo}/${owner}/${page}`.toLowerCase().trim()
    }
);
