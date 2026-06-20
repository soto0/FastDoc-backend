import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { errorHandler } from '@/middleware/errorHandler';
import { AppError } from '@/utils/appError';

/* eslint-disable ts/no-unsafe-assignment */

const createTestApp = () => {
    const app = new Hono();
    app.onError(errorHandler);

    app.get('/zod', (c) => {
        z.object({ query: z.string().min(1, 'Invalid query') }).parse({ query: '' });
        return c.text('ok');
    });

    app.get('/app-error', () => {
        throw new AppError(404, 'Not found', 'NOT_FOUND');
    });

    app.get('/unknown', () => {
        throw new Error('unexpected');
    });

    return app;
};

describe('errorHandler', () => {
    it('returns 400 with validation details for ZodError', async () => {
        const res = await createTestApp().request('/zod');

        expect(res.status).toBe(400);

        const data = await res.json();
        expect(data).toMatchObject({
            success: false,
            error: 'Invalid query',
            details: [{ field: 'query', message: 'Invalid query', code: 'too_small' }]
        });
    });

    it('returns AppError status and code', async () => {
        const res = await createTestApp().request('/app-error');

        expect(res.status).toBe(404);

        const data = await res.json();
        expect(data).toMatchObject({
            success: false,
            error: 'Not found',
            code: 'NOT_FOUND'
        });
    });

    it('returns 500 for unhandled errors', async () => {
        const res = await createTestApp().request('/unknown');

        expect(res.status).toBe(500);

        const data = await res.json();
        expect(data).toMatchObject({
            success: false,
            error: 'Internal server error'
        });
    });
});
