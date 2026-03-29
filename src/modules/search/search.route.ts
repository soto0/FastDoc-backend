import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { searchSchema } from './search.schema';

const searchRoute = new Hono();

searchRoute.post(
    '/',
    zValidator('json', searchSchema, (result, c) => {
        if (!result.success) {
            return c.json({ error: 'Заполните поле!', success: false }, 400);
        }
    }),
    (c) => {
        return c.json({ answer: 'Мы работаем над этим', success: true });
    }
);

export default searchRoute;
