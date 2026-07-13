import { APIConnectionError, APIError } from 'openai';
import { describe, expect, it } from 'vitest';
import { mapOpenAIError } from '@/services/ai/mapError.service';
import { AppError } from '@/utils/appError';

const expectAppError = (fn: () => never, status: number, code: string, message?: string) => {
    try {
        fn();
        expect.fail('Expected AppError to be thrown');
    } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).status).toBe(status);
        expect((error as AppError).code).toBe(code);
        if (message != null) expect((error as AppError).message).toBe(message);
    }
};

describe('mapOpenAIError', () => {
    it('maps APIConnectionError to 503', () => {
        expectAppError(() => mapOpenAIError(new APIConnectionError({ message: 'connection failed' })), 503, 'AI_CONNECTION_ERROR');
    });

    it.each([
        [400, 'AI_INVALID_REQUEST'],
        [401, 'AI_UNAUTHORIZED'],
        [403, 'AI_FORBIDDEN'],
        [404, 'AI_NOT_FOUND'],
        [422, 'AI_INVALID_DATA'],
        [429, 'AI_TOO_MANY_REQUESTS']
    ] as const)('maps APIError %i to AppError with code %s', (status, code) => {
        expectAppError(() => mapOpenAIError(new APIError(status, undefined, 'error', undefined)), status, code);
    });

    it('maps APIError 500+ to AI_UNKNOWN_ERROR', () => {
        expectAppError(() => mapOpenAIError(new APIError(500, undefined, 'error', undefined)), 500, 'AI_UNKNOWN_ERROR');
    });

    it('keeps OpenAI 400 message for diagnostics', () => {
        expectAppError(
            () => mapOpenAIError(new APIError(400, undefined, "Unsupported parameter: 'temperature'", undefined)),
            400,
            'AI_INVALID_REQUEST',
            "Неверный запрос OpenAI: Unsupported parameter: 'temperature'"
        );
    });

    it('keeps OpenAI 429 message for diagnostics', () => {
        expectAppError(
            () => mapOpenAIError(new APIError(429, undefined, 'You exceeded your current quota', undefined)),
            429,
            'AI_TOO_MANY_REQUESTS',
            'Лимит OpenAI исчерпан: You exceeded your current quota'
        );
    });

    it('maps unknown errors to UNKNOWN_ERROR', () => {
        expectAppError(() => mapOpenAIError(new Error('unexpected')), 500, 'UNKNOWN_ERROR');
    });
});
