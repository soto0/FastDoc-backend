import { LRUCache } from 'lru-cache';

type AsyncFn<T, A extends any[]> = (...args: A) => Promise<T>;

export const cacheClient = <T extends object, A extends any[]>(fn: AsyncFn<T, A>, options: { ttl: number; keyFn: (...args: A) => string }) => {
    const cache = new LRUCache<string, T>({
        max: 500,
        ttl: options.ttl,
        sizeCalculation: (v) => JSON.stringify(v).length,
        maxSize: 50 * 1024 * 1024
    });

    return async (...args: A): Promise<T> => {
        const key = options.keyFn?.(...args) || JSON.stringify(args);

        const cached = cache.get(key);
        if (cached) return cached;

        const result = await fn(...args);
        cache.set(key, result);
        return result;
    };
};
