import type { ContentfulStatusCode } from 'hono/utils/http-status';

export class AppError extends Error {
    constructor(
        public status: ContentfulStatusCode,
        message: string,
        public code: string
    ) {
        super(message);
        this.name = 'AppError';
    }
}
