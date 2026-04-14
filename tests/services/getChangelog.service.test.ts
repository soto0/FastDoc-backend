import { afterEach, describe, expect, it, vi } from 'vitest';
import { getChangelog } from '@/services/getChangelog.service';
import * as getReleaseModule from '@/services/github/getRelease.service';
import * as formatChangelogModule from '@/services/groq/formatChangelog.service';
import * as parseSearchModule from '@/services/groq/parseSearch.service';

afterEach(() => {
    vi.restoreAllMocks();
});

describe('getChangelog', () => {
    it('возвращает отформатированный changelog', async () => {
        vi.spyOn(parseSearchModule, 'parseSearch').mockResolvedValue({
            library: 'react',
            version: '18.0.0',
            owner: 'facebook',
            repo: 'react'
        });
        vi.spyOn(getReleaseModule, 'getRelease').mockResolvedValue('raw body');
        vi.spyOn(formatChangelogModule, 'formatChangelog').mockResolvedValue('formatted body');

        await expect(getChangelog('react 18')).resolves.toBe('formatted body');

        expect(getReleaseModule.getRelease).toHaveBeenCalledWith({
            owner: 'facebook',
            repo: 'react',
            version: '18.0.0'
        });
        expect(formatChangelogModule.formatChangelog).toHaveBeenCalledWith({
            owner: 'facebook',
            repo: 'react',
            version: '18.0.0',
            changelog: 'raw body'
        });
    });

    it('бросает PARSE_SEARCH_ERROR если parseSearch вернул null', async () => {
        vi.spyOn(parseSearchModule, 'parseSearch').mockResolvedValue(null);

        await expect(getChangelog('x')).rejects.toMatchObject({
            status: 400,
            code: 'PARSE_SEARCH_ERROR'
        });
    });

    it('бросает FORMAT_CHANGELOG_ERROR если formatChangelog вернул null', async () => {
        vi.spyOn(parseSearchModule, 'parseSearch').mockResolvedValue({
            library: 'a',
            version: '1.0.0',
            owner: 'o',
            repo: 'r'
        });
        vi.spyOn(getReleaseModule, 'getRelease').mockResolvedValue('raw');
        vi.spyOn(formatChangelogModule, 'formatChangelog').mockResolvedValue(null);

        await expect(getChangelog('q')).rejects.toMatchObject({
            status: 400,
            code: 'FORMAT_CHANGELOG_ERROR'
        });
    });
});
