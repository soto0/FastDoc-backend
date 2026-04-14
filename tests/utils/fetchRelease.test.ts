import { afterEach, describe, expect, it, vi } from 'vitest';
import githubClient from '@/config/githubClient';
import { fetchRelease } from '@/utils/fetchRelease';

vi.mock('@/config/githubClient', () => ({
    default: { request: vi.fn() }
}));

afterEach(() => {
    vi.mocked(githubClient.request).mockReset();
});

describe('fetchRelease', () => {
    it('возвращает body релиза', async () => {
        vi.mocked(githubClient.request).mockResolvedValueOnce({
            data: { body: '## Changelog\n- fix' }
        } as never);

        await expect(fetchRelease({ owner: 'foo', repo: 'bar', tag: 'v1.0.0' })).resolves.toBe('## Changelog\n- fix');

        expect(githubClient.request).toHaveBeenCalledWith('GET /repos/{owner}/{repo}/releases/tags/{tag}', {
            owner: 'foo',
            repo: 'bar',
            tag: 'v1.0.0'
        });
    });

    it('бросает AppError если body пустой', async () => {
        vi.mocked(githubClient.request).mockResolvedValueOnce({
            data: { body: null }
        } as never);

        await expect(fetchRelease({ owner: 'a', repo: 'b', tag: '1' })).rejects.toMatchObject({
            status: 404,
            code: 'GITHUB_RELEASE_NOT_FOUND'
        });
    });

    it('пробрасывает ошибку запроса к GitHub как есть', async () => {
        vi.mocked(githubClient.request).mockRejectedValueOnce(new Error('network'));

        await expect(fetchRelease({ owner: 'a', repo: 'b', tag: 'v1' })).rejects.toThrow('network');
    });
});
