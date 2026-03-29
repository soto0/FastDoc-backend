import { describe, expect, it } from 'vitest';
import app from '../../app';

describe('search endpoint', () => {
    it('should return search result', async () => {
        const res = await app.request('/api/search', {
            method: 'POST',
            body: JSON.stringify({ query: 'test search' }),
            headers: new Headers({ 'Content-Type': 'application/json' })
        });

        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ answer: 'Мы работаем над этим', success: true });
    });

    it('if should validation failed', async () => {
        const res = await app.request('api/search', {
            method: 'POST',
            body: JSON.stringify({ query: '' }),
            headers: new Headers({ 'Content-Type': 'application/json' })
        });

        expect(res.status).toBe(400);
        expect(await res.json()).toEqual({ error: 'Заполните поле!', success: false });
    });
});
