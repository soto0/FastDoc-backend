import { createRoute, OpenAPIHono } from '@hono/zod-openapi';
import { releasesParams, releasesResponseSchema } from './releases.schema';
import { releasesService } from './releases.service';

const releasesRoute = new OpenAPIHono();

releasesRoute.openapi(
    createRoute({
        method: 'get',
        path: '/',
        summary: 'Поиск релизов репозитория',
        request: { query: releasesParams },
        responses: {
            200: { content: { 'application/json': { schema: releasesResponseSchema } }, description: 'Успешный ответ' },
            400: { description: 'Ошибка валидации' }
        }
    }),
    async (c) => {
        const params = c.req.valid('query');
        const result = await releasesService(params);

        return c.json({ payload: result.releases, meta: { success: true, hasMore: result.hasMore } });
    }
);

export default releasesRoute;
