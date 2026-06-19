import { describe, expect, it, vi } from 'vitest';
import { getReleases } from './getReleases.service';

const { requestMock } = vi.hoisted(() => ({
    requestMock: vi.fn()
}));

vi.mock('@/config/githubClient', () => ({
    default: {
        request: requestMock
    }
}));

describe('getReleases', () => {
    it('returns an empty stable page while preserving GitHub pagination', async () => {
        requestMock.mockResolvedValueOnce({
            data: [{ id: 1, tag_name: 'v2.0.0-beta.1', name: 'Beta', prerelease: true }],
            headers: { link: '<https://api.github.com/repos/test/repo/releases?page=2>; rel="next"' }
        });

        const result = await getReleases({ owner: 'test', repo: 'repo', page: 1 });

        expect(result).toEqual({ releases: [], hasMore: true });
        expect(requestMock).toHaveBeenCalledWith('GET /repos/{owner}/{repo}/releases', {
            owner: 'test',
            repo: 'repo',
            page: 1,
            per_page: 20
        });
    });

    it('maps stable releases and falls back to tag name', async () => {
        requestMock.mockResolvedValueOnce({
            data: [
                { id: 1, tag_name: 'v2.0.0-beta.1', name: 'Beta', prerelease: true },
                { id: 2, tag_name: 'v1.0.0', name: null, prerelease: false }
            ],
            headers: {}
        });

        const result = await getReleases({ owner: 'test', repo: 'repo', page: 2 });

        expect(result).toEqual({
            releases: [{ id: 2, tag: 'v1.0.0', name: 'v1.0.0' }],
            hasMore: false
        });
    });
});
