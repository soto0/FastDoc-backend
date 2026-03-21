import { serve } from '@hono/node-server';
import { Hono } from 'hono';

const app = new Hono();
serve({ fetch: app.fetch, port: 3000 });

export default app;
