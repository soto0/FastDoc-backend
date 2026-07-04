import type { AppEnv } from '@/types/AppEnv';
import { createRoute, OpenAPIHono } from '@hono/zod-openapi';
import { searchParams, searchSchema } from './search.schema';
import { searchService } from './search.service';

const searchRoute = new OpenAPIHono<AppEnv>();

searchRoute.openapi(
    createRoute({
        method: 'get',
        path: '/',
        summary: 'Поиск по названию',
        request: { query: searchParams },
        responses: {
            200: { content: { 'application/json': { schema: searchSchema } }, description: 'Успешный ответ' },
            400: { description: 'Ошибка валидации' }
        }
    }),
    async (c) => {
        const { query } = c.req.valid('query');
        const result = await searchService(query, c.env);

        return c.json({ payload: result, meta: { success: true } });
    }
);

export default searchRoute;
