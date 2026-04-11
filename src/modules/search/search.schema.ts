import { z } from '@hono/zod-openapi';

export const searchSchema = z.object({
    query: z.string().min(3, { message: 'Минимум 3 символа' }).openapi({
        description: 'Поисковый запрос',
        example: 'test search'
    })
});

export const searchResponse = z.object({
    answer: z.string(),
    success: z.boolean()
});
