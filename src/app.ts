import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { poweredBy } from 'hono/powered-by';
import { errorHandler } from './middleware/error-handler.ts';
import searchRoute from './modules/search/search.route.ts';

const app = new Hono();

app.use(poweredBy());
app.use(logger());
app.onError(errorHandler);

const api = app.basePath('/api');

api.route('/search', searchRoute);

export type AppType = typeof app;
export default app;
