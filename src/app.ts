import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { poweredBy } from 'hono/powered-by';
import searchRoute from './modules/search/search.route.ts';

const app = new Hono();

app.use(poweredBy());
app.use(logger());

const api = app.basePath('/api');

api.route('/search', searchRoute);

export type AppType = typeof app;
export default app;
