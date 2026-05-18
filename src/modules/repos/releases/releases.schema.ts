import { z } from '@hono/zod-openapi';

export const releasesParams = z.object({
    repo: z
        .string()
        .min(1, 'Название обязательно')
        .openapi({
            param: { name: 'repo', in: 'query' },
            example: 'next.js'
        }),
    owner: z
        .string()
        .min(1, 'Владелец не указан')
        .openapi({
            param: { name: 'owner', in: 'query' },
            example: 'vercel'
        })
});

export const releasesSchema = z.object({
    id: z.number(),
    name: z.string(),
    tag: z.string()
});
