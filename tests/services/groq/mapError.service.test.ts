import { APIConnectionError, APIError } from 'groq-sdk';
import { describe, expect, it } from 'vitest';
import { mapGroqError } from '@/services/groq/mapError.service';
import { AppError } from '@/utils/appError';

const expectAppError = (fn: () => never, status: number, code: string) => {
    try {
        fn();
        expect.fail('Expected AppError to be thrown');
    } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).status).toBe(status);
        expect((error as AppError).code).toBe(code);
    }
};

describe('mapGroqError', () => {
    it('maps APIConnectionError to 503', () => {
        expectAppError(() => mapGroqError(new APIConnectionError({ message: 'connection failed' })), 503, 'AI_CONNECTION_ERROR');
    });

    it.each([
        [400, 'AI_INVALID_REQUEST'],
        [401, 'AI_UNAUTHORIZED'],
        [403, 'AI_FORBIDDEN'],
        [404, 'AI_NOT_FOUND'],
        [422, 'AI_INVALID_DATA'],
        [429, 'AI_TOO_MANY_REQUESTS']
    ] as const)('maps APIError %i to AppError with code %s', (status, code) => {
        expectAppError(() => mapGroqError(new APIError(status, undefined, 'error', undefined)), status, code);
    });

    it('maps APIError 500+ to AI_UNKNOWN_ERROR', () => {
        expectAppError(() => mapGroqError(new APIError(500, undefined, 'error', undefined)), 500, 'AI_UNKNOWN_ERROR');
    });

    it('maps unknown errors to UNKNOWN_ERROR', () => {
        expectAppError(() => mapGroqError(new Error('unexpected')), 500, 'UNKNOWN_ERROR');
    });
});
