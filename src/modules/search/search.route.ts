import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import { validationHandler } from '../../utils/validation-handler.ts';
import { searchSchema } from './search.schema';

const searchRoute = new OpenAPIHono({ defaultHook: validationHandler });

const searchResponse = z.object({
    answer: z.string(),
    success: z.boolean()
});

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
    (c) => {
        return c.json({ answer: 'Мы работаем над этим', success: true });
    }
);

export default searchRoute;
