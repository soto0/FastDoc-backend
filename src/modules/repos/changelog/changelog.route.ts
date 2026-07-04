import type { AppEnv } from '@/types/AppEnv';
import { createRoute, OpenAPIHono } from '@hono/zod-openapi';
import { changelogParams, changelogSchema } from './changelog.schema';
import { changelogService } from './changelog.service';

const changelogRoute = new OpenAPIHono<AppEnv>();

changelogRoute.openapi(
    createRoute({
        method: 'get',
        path: '/',
        summary: 'Changelog релиза репозитория',
        request: { query: changelogParams },
        responses: {
            200: { content: { 'application/json': { schema: changelogSchema } }, description: 'Успешный ответ' },
            400: { description: 'Ошибка валидации' }
        }
    }),
    async (c) => {
        const params = c.req.valid('query');
        const result = await changelogService(params, c.env);

        return c.json({ payload: result, meta: { success: true } });
    }
);

export default changelogRoute;
