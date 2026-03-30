import { describe, expect, it } from 'vitest';
import app from '../../app';
import { expectError } from '../../utils/test-helpers';

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

    it('should return 400 when query is too short or empty', async () => {
        const res = await app.request('/api/search', {
            method: 'POST',
            body: JSON.stringify({ query: 'ab' }),
            headers: new Headers({ 'Content-Type': 'application/json' })
        });

        await expectError(res, 400, 'Минимум 3 символа');
    });
});
