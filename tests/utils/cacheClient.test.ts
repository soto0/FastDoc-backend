import { describe, expect, it, vi } from 'vitest';
import { cacheClient } from '@/utils/cacheClient';

describe('cacheClient', () => {
    it('calls the underlying function on cache miss and returns its result', async () => {
        const fn = vi.fn().mockResolvedValue({ value: 42 });
        const cached = cacheClient(fn, { ttl: 60_000, keyFn: (key: string) => key });

        const result = await cached('key-a');

        expect(result).toEqual({ value: 42 });
        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith('key-a');
    });

    it('returns cached result without calling the function again', async () => {
        const fn = vi.fn().mockResolvedValue({ value: 42 });
        const cached = cacheClient(fn, { ttl: 60_000, keyFn: (key: string) => key });

        await cached('key-b');
        await cached('key-b');

        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('normalizes cache keys via keyFn', async () => {
        const fn = vi.fn().mockResolvedValue('result');
        const cached = cacheClient(fn, {
            ttl: 60_000,
            keyFn: (key: string) => key.toLowerCase().trim()
        });

        await cached('  Hello  ');
        await cached('hello');

        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('expires cached entries after TTL', async () => {
        const fn = vi.fn().mockResolvedValue('fresh');
        const cached = cacheClient(fn, { ttl: 50, keyFn: (key: string) => key });

        await cached('ttl-key');
        await new Promise((resolve) => setTimeout(resolve, 60));
        await cached('ttl-key');

        expect(fn).toHaveBeenCalledTimes(2);
    });
});
