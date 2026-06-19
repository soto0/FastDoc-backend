import { z } from '@hono/zod-openapi';

export const changelogParams = z.object({
    repo: z
        .string()
        .min(1, 'Репозиторий обязателен')
        .openapi({ param: { name: 'repo', in: 'query' }, example: 'next.js' }),
    owner: z
        .string()
        .min(1, 'Владелец не указан')
        .openapi({ param: { name: 'owner', in: 'query' }, example: 'vercel' }),
    tag: z
        .string()
        .min(1, 'Версия не указана')
        .openapi({ param: { name: 'tag', in: 'query' }, example: 'v16.3.0-canary.18' })
});

export const changelogSchema = z.object({
    changelog: z.string()
});
