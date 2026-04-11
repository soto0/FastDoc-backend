import { afterEach, describe, expect, it, vi } from 'vitest';
import { getLatestLibraryVersion } from '@/services/npmRegistry/getLatestLibraryVersion.service';

const npmResponse = (body: object, status = 200, ok = true) =>
    ({
        ok,
        status,
        json: async () => body
    }) as Response;

afterEach(() => {
    vi.restoreAllMocks();
});

describe('getLatestLibraryVersion', () => {
    it('returns latest from dist-tags', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(npmResponse({ 'dist-tags': { latest: '2.0.1' } }));

        await expect(getLatestLibraryVersion('some-pkg')).resolves.toEqual({ version: '2.0.1' });
        expect(fetch).toHaveBeenCalledWith('https://registry.npmjs.org/some-pkg');
    });

    it('throws AppError on 404', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(npmResponse({}, 404, false));

        await expect(getLatestLibraryVersion('missing-pkg')).rejects.toMatchObject({
            status: 404,
            code: 'NPM_NOT_FOUND'
        });
    });

    it('throws AppError on non-ok non-404', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(npmResponse({}, 502, false));

        await expect(getLatestLibraryVersion('pkg')).rejects.toMatchObject({
            status: 500,
            code: 'NPM_REGISTRY_ERROR'
        });
    });
});
