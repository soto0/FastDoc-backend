import { beforeEach, describe, expect, it, vi } from 'vitest';
import { changelogService } from '@/modules/repos/changelog/changelog.service';

const { getChangelogMock, formatChangelogMock } = vi.hoisted(() => ({
    getChangelogMock: vi.fn(),
    formatChangelogMock: vi.fn()
}));

vi.mock('@/services/github/getChangelog.service', () => ({
    getChangelog: getChangelogMock
}));

vi.mock('@/services/groq/formatChangelog.service', () => ({
    formatChangelog: formatChangelogMock
}));

describe('changelogService', () => {
    beforeEach(() => {
        getChangelogMock.mockReset();
        formatChangelogMock.mockReset();
    });

    it('returns formatted changelog on success', async () => {
        getChangelogMock.mockResolvedValueOnce('raw body');
        formatChangelogMock.mockResolvedValueOnce({ changelog: 'formatted' });

        const result = await changelogService({ owner: 'vercel', repo: 'next.js', tag: 'v14-cache-1' });

        expect(result).toEqual({ changelog: 'formatted' });
    });

    it('throws CHANGELOG_NOT_FOUND when release body is null', async () => {
        getChangelogMock.mockResolvedValueOnce(null);

        await expect(changelogService({ owner: 'vercel', repo: 'next.js', tag: 'v14-cache-2' })).rejects.toMatchObject({
            status: 404,
            code: 'CHANGELOG_NOT_FOUND'
        });
    });

    it('throws FORMAT_CHANGELOG_ERROR when Groq returns no content', async () => {
        getChangelogMock.mockResolvedValueOnce('raw body');
        formatChangelogMock.mockResolvedValueOnce(null);

        await expect(changelogService({ owner: 'vercel', repo: 'next.js', tag: 'v14-cache-3' })).rejects.toMatchObject({
            status: 400,
            code: 'FORMAT_CHANGELOG_ERROR'
        });
    });

    it('caches results using normalized cache keys', async () => {
        getChangelogMock.mockResolvedValue('raw body');
        formatChangelogMock.mockResolvedValue({ changelog: 'formatted' });

        await changelogService({ owner: 'Vercel', repo: 'Next.js', tag: 'V14.0.0' });
        await changelogService({ owner: 'vercel', repo: 'next.js', tag: 'v14.0.0' });

        expect(getChangelogMock).toHaveBeenCalledTimes(1);
        expect(formatChangelogMock).toHaveBeenCalledTimes(1);
    });
});
