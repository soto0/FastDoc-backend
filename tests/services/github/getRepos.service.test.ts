import { mockGithubRepos } from '@tests/helpers/testHelper';
import { describe, expect, it, vi } from 'vitest';
import { getRepos } from '@/services/github/getRepos.service';

const { requestMock } = vi.hoisted(() => ({
    requestMock: vi.fn()
}));

vi.mock('@/config/githubClient', () => ({
    default: {
        request: requestMock
    }
}));

describe('getRepos', () => {
    it('maps GitHub search items to IRepos', async () => {
        requestMock.mockResolvedValueOnce(
            mockGithubRepos([
                { id: 1, name: 'next.js', owner: { login: 'vercel' } },
                { id: 2, name: 'react', owner: { login: 'facebook' } }
            ])
        );

        const result = await getRepos('next');

        expect(result).toEqual([
            { id: 1, repo: 'next.js', owner: 'vercel' },
            { id: 2, repo: 'react', owner: 'facebook' }
        ]);
    });

    it('passes the query to Octokit', async () => {
        requestMock.mockResolvedValueOnce(mockGithubRepos());

        await getRepos('typescript');

        expect(requestMock).toHaveBeenCalledWith('GET /search/repositories?q={q}&per_page=15&page=1&sort=stars', {
            q: 'typescript'
        });
    });
});
