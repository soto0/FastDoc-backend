import type { Hook } from '@hono/zod-openapi';
import type { Env } from 'hono';

export const validationHandler: Hook<unknown, Env, string, void> = (result, _c) => {
    if (!result.success) {
        throw result.error;
    }
};
