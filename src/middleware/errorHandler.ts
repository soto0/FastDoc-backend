import type { ErrorHandler } from 'hono';
import { ZodError } from 'zod';
import { AppError } from '@/utils/appError';

export const errorHandler: ErrorHandler = (err, c) => {
    if (err instanceof ZodError) {
        const errors = err.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
            code: issue.code
        }));

        const errorMessage = errors[0]?.message || 'Validation failed';

        return c.json({ error: errorMessage, details: errors, success: false }, 400);
    }

    if (err instanceof AppError) {
        return c.json({ error: err.message, code: err.code, success: false }, err.status);
    }

    return c.json({ error: 'Internal server error', success: false }, 500);
};
