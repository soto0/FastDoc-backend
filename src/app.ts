import type { AppBindings, AppEnv } from '@/types/AppEnv';
import { OpenAPIHono } from '@hono/zod-openapi';
import { Scalar } from '@scalar/hono-api-reference';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { poweredBy } from 'hono/powered-by';
import { getRuntimeEnv } from '@/config/runtimeEnv';
import { errorHandler } from '@/middleware/errorHandler.ts';
import reposRouter from './modules/repos';

const DEFAULT_FRONTEND_URL = 'http://localhost:5173';

const getAllowedOrigins = (env: AppBindings | undefined): string[] =>
    (getRuntimeEnv(env, 'FRONTEND_URL') ?? DEFAULT_FRONTEND_URL)
        .split(',')
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0);

const app = new OpenAPIHono<AppEnv>();

app.use(poweredBy());
app.use(logger());
app.use(
    cors({
        origin: (origin, c) => {
            const allowedOrigins = getAllowedOrigins(c.env as AppBindings | undefined);

            return allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
        },
        allowHeaders: ['Content-Type'],
        allowMethods: ['GET', 'POST', 'OPTIONS']
    })
);
app.onError(errorHandler);

const api = app.basePath('/api');

api.route('/repos', reposRouter);

api.doc('/documentation', {
    openapi: '3.0.0',
    info: { title: 'FastDoc API', version: '1.0.0', description: 'API для FastDoc' }
});

api.get('/doc', Scalar({ url: '/api/documentation', theme: 'alternate' }));

export type AppType = typeof app;
export default app;
