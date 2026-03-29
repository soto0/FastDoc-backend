import z from 'zod';

export const searchSchema = z.object({
    query: z
        .string()
        .min(3, { message: 'Минимум 3 символа' })
        .refine((val) => val.length > 0, { message: 'Заполните поле' })
});
