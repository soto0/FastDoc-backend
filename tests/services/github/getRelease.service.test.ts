import { afterEach, describe, expect, it, vi } from 'vitest';
import { getRelease } from '@/services/github/getRelease.service';
import * as fetchReleaseModule from '@/utils/fetchRelease';

afterEach(() => {
    vi.restoreAllMocks();
});

describe('getRelease', () => {
    it('сначала запрашивает тег с префиксом v', async () => {
        vi.spyOn(fetchReleaseModule, 'fetchRelease').mockResolvedValueOnce('notes');

        await expect(getRelease({ owner: 'fb', repo: 'react', version: '18.0.0' })).resolves.toBe('notes');

        expect(fetchReleaseModule.fetchRelease).toHaveBeenCalledTimes(1);
        expect(fetchReleaseModule.fetchRelease).toHaveBeenCalledWith({ owner: 'fb', repo: 'react', tag: 'v18.0.0' });
    });

    it('при ошибке v-версии повторяет запрос с версией без префикса', async () => {
        vi.spyOn(fetchReleaseModule, 'fetchRelease')
            .mockRejectedValueOnce(new Error('404'))
            .mockResolvedValueOnce('plain tag body');

        await expect(getRelease({ owner: 'x', repo: 'y', version: '1.0.0' })).resolves.toBe('plain tag body');

        expect(fetchReleaseModule.fetchRelease).toHaveBeenNthCalledWith(1, { owner: 'x', repo: 'y', tag: 'v1.0.0' });
        expect(fetchReleaseModule.fetchRelease).toHaveBeenNthCalledWith(2, { owner: 'x', repo: 'y', tag: '1.0.0' });
    });
});
