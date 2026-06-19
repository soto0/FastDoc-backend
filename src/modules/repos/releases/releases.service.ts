import type { IReleasesPage } from '@/types/IReleases';
import { getReleases } from '@/services/github/getReleases.service';
import { cacheClient } from '@/utils/cacheClient';

interface ReleasesServiceParams {
    repo: string;
    owner: string;
    page: number;
}

export const releasesService = cacheClient(async (params: ReleasesServiceParams): Promise<IReleasesPage> => getReleases(params), {
    ttl: 1000 * 60 * 5,
    keyFn: ({ repo, owner, page }) => `${repo}/${owner}/${page}`.toLowerCase().trim()
});
