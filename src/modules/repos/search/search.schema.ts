import { z } from '@hono/zod-openapi';

export const searchParams = z.object({
    query: z
        .string()
        .min(3, { message: 'Минимум 3 символа' })
        .openapi({
            param: { name: 'query', in: 'query' },
            description: 'Поисковой запрос репозитория по названию',
            example: 'next.js'
        })
});

export const searchSchema = z.object({
    id: z.number(),
    repo: z.string(),
    owner: z.string()
});
