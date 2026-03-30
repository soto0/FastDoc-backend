import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { searchSchema } from './search.schema';

const searchRoute = new Hono();

searchRoute.post(
    '/',
    zValidator('json', searchSchema, (result) => {
        if (!result.success) throw result.error;
    }),
    (c) => {
        return c.json({ answer: 'Мы работаем над этим', success: true });
    }
);

export default searchRoute;
