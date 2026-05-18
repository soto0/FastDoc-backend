import { createRoute, OpenAPIHono } from '@hono/zod-openapi';
import { releasesParams, releasesSchema } from './releases.schema';
import { releasesService } from './releases.service';

const releasesRoute = new OpenAPIHono();

releasesRoute.openapi(
    createRoute({
        method: 'get',
        path: '/',
        summary: 'Поиск релизов репозитория',
        request: { query: releasesParams },
        responses: {
            200: { content: { 'application/json': { schema: releasesSchema } }, description: 'Успешный ответ' },
            400: { description: 'Ошибка валидации' }
        }
    }),
    async (c) => {
        const params = c.req.valid('query');
        const result = await releasesService(params);

        return c.json({ payload: result, meta: { success: true } });
    }
);

export default releasesRoute;
