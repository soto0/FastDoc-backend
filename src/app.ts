import process from 'node:process';
import { OpenAPIHono } from '@hono/zod-openapi';
import { Scalar } from '@scalar/hono-api-reference';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { poweredBy } from 'hono/powered-by';
import { errorHandler } from '@/middleware/errorHandler.ts';
// import searchRoute from '@/modules/search/search.route.ts';
import reposRouter from './modules/repos';

const app = new OpenAPIHono();

app.use(poweredBy());
app.use(logger());
app.use(
    cors({
        origin: [process.env.FRONTEND_URL ?? 'http://localhost:5173'],
        allowHeaders: ['Content-Type'],
        allowMethods: ['GET', 'POST', 'OPTIONS']
    })
);
app.onError(errorHandler);

const api = app.basePath('/api');

api.route('/repos', reposRouter);
// api.route('/search', searchRoute);

api.doc('/documentation', {
    openapi: '3.0.0',
    info: { title: 'FastDoc API', version: '1.0.0', description: 'API для FastDoc' }
});

api.get('/doc', Scalar({ url: '/api/documentation', theme: 'alternate' }));

export type AppType = typeof app;
export default app;
