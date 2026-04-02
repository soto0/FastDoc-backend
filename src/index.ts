import process from 'node:process';
import { serve } from '@hono/node-server';
import app from './app.ts';
import { loadEnv } from './config/load-env.ts';

loadEnv();

const port = Number(process.env.PORT) || 3000;
serve({ fetch: app.fetch, port });
