import { beforeEach, describe, expect, it, vi } from 'vitest';
import { searchService } from '@/modules/repos/search/search.service';

const { getReposMock } = vi.hoisted(() => ({
    getReposMock: vi.fn()
}));

vi.mock('@/services/github/getRepos.service', () => ({
    getRepos: getReposMock
}));

describe('searchService', () => {
    beforeEach(() => {
        getReposMock.mockReset();
    });

    it('returns repositories when GitHub has results', async () => {
        const repos = [{ id: 1, repo: 'next.js', owner: 'vercel' }];
        getReposMock.mockResolvedValueOnce(repos);

        const result = await searchService('next-cache-test-1');

        expect(result).toEqual(repos);
    });

    it('throws REPOS_NOT_FOUND when GitHub returns an empty list', async () => {
        getReposMock.mockResolvedValueOnce([]);

        await expect(searchService('empty-cache-test-1')).rejects.toMatchObject({
            status: 404,
            code: 'REPOS_NOT_FOUND',
            message: 'Репозитории не найдены'
        });
    });

    it('caches results using normalized query keys', async () => {
        getReposMock.mockResolvedValue([{ id: 2, repo: 'react', owner: 'facebook' }]);

        await searchService(' Next.js ');
        await searchService('next.js');

        expect(getReposMock).toHaveBeenCalledTimes(1);
    });
});
