import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import { validationHandler } from '../../utils/validation-handler.ts';
import { searchSchema } from './search.schema';
import { searchService } from './search.service.ts';

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
    async (c) => {
        const query = c.req.valid('json').query;
        const response = await searchService(query);

        return c.json({ answer: response.choices[0]?.message.content ?? '', success: true });
    }
);

export default searchRoute;
