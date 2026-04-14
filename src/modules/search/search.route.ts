import { createRoute, OpenAPIHono } from '@hono/zod-openapi';
import { searchResponse, searchSchema } from '@/modules/search/search.schema';
import { searchService } from '@/modules/search/search.service';

const searchRoute = new OpenAPIHono();

searchRoute.openapi(
    createRoute({
        method: 'post',
        path: '/',
        summary: 'Поиск',
        request: { body: { content: { 'application/json': { schema: searchSchema } } } },
        responses: {
            200: { content: { 'application/json': { schema: searchResponse } }, description: 'Успешный ответ' },
            400: { description: 'Ошибка валидации' }
        }
    }),
    async (c) => {
        const query = c.req.valid('json').query;
        const changelog = await searchService(query);

        return c.json({ changelog, success: true });
    }
);

export default searchRoute;
