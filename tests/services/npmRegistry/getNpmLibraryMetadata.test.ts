import { afterEach, describe, expect, it, vi } from 'vitest';
import { getNpmLibraryMetadata } from '@/services/npmRegistry/getNpmLibraryMetadata';

const npmResponse = (body: object, status = 200, ok = true) =>
    ({
        ok,
        status,
        json: async () => body
    }) as Response;

afterEach(() => {
    vi.restoreAllMocks();
});

describe('getNpmLibraryMetadata', () => {
    it('returns version, owner and repo from registry payload', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
            npmResponse({
                version: '2.0.1',
                repository: { url: 'git+https://github.com/foo/some-pkg.git' }
            })
        );

        await expect(getNpmLibraryMetadata({ library: 'some-pkg', version: '2.0.1' })).resolves.toEqual({
            version: '2.0.1',
            owner: 'foo',
            repo: 'some-pkg'
        });
        expect(fetch).toHaveBeenCalledWith('https://registry.npmjs.org/some-pkg/2.0.1');
    });

    it('uses latest when version is empty', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
            npmResponse({
                version: '1.0.0',
                repository: { url: 'git+https://github.com/acme/pkg.git' }
            })
        );

        await getNpmLibraryMetadata({ library: 'pkg', version: '' });
        expect(fetch).toHaveBeenCalledWith('https://registry.npmjs.org/pkg/latest');
    });

    it('throws AppError on 404', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(npmResponse({}, 404, false));

        await expect(getNpmLibraryMetadata({ library: 'missing-pkg', version: 'latest' })).rejects.toMatchObject({
            status: 404,
            code: 'NPM_NOT_FOUND'
        });
    });

    it('throws AppError on non-ok non-404', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(npmResponse({}, 502, false));

        await expect(getNpmLibraryMetadata({ library: 'pkg', version: '1.0.0' })).rejects.toMatchObject({
            status: 500,
            code: 'NPM_REGISTRY_ERROR'
        });
    });

    it('throws when repository is missing', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(npmResponse({ version: '1.0.0' }));

        await expect(getNpmLibraryMetadata({ library: 'pkg', version: '1.0.0' })).rejects.toMatchObject({
            status: 400,
            code: 'RESOLVE_REPOSITORY_ERROR'
        });
    });
});
