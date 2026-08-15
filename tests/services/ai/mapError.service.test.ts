import { APIConnectionError, APIError } from 'openai';
import { describe, expect, it } from 'vitest';
import { mapGeminiError, mapOpenAIError } from '@/services/ai/mapError.service';
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

    it('keeps OpenAI 404 message for diagnostics', () => {
        expectAppError(
            () => mapOpenAIError(new APIError(404, undefined, 'The model does not exist', undefined)),
            404,
            'AI_NOT_FOUND',
            'Модель OpenAI не найдена или недоступна: The model does not exist'
        );
    });

    it('maps unknown errors to UNKNOWN_ERROR', () => {
        expectAppError(() => mapOpenAIError(new Error('unexpected')), 500, 'UNKNOWN_ERROR');
    });
});

describe('mapGeminiError', () => {
    it.each([
        [400, 'AI_INVALID_REQUEST'],
        [401, 'AI_UNAUTHORIZED'],
        [403, 'AI_FORBIDDEN'],
        [404, 'AI_NOT_FOUND'],
        [422, 'AI_INVALID_DATA'],
        [429, 'AI_TOO_MANY_REQUESTS']
    ] as const)('maps Gemini error %i to AppError with code %s', (status, code) => {
        expectAppError(() => mapGeminiError({ status, message: 'provider error' }), status, code);
    });

    it('keeps Gemini 429 message for diagnostics', () => {
        expectAppError(
            () => mapGeminiError({ status: 429, message: 'quota exceeded' }),
            429,
            'AI_TOO_MANY_REQUESTS',
            'Лимит Gemini исчерпан: quota exceeded'
        );
    });

    it('keeps Gemini 404 message for diagnostics', () => {
        expectAppError(
            () => mapGeminiError({ status: 404, message: 'models/gemini-custom is not found' }),
            404,
            'AI_NOT_FOUND',
            'Модель Gemini не найдена или недоступна: models/gemini-custom is not found'
        );
    });

    it('maps Gemini 500+ to AI_UNKNOWN_ERROR', () => {
        expectAppError(() => mapGeminiError({ status: 503, message: 'unavailable' }), 500, 'AI_UNKNOWN_ERROR', 'Gemini временно недоступен: unavailable');
    });

    it('maps wrapped Gemini status errors to provider AppError', () => {
        const error = new Error('exception sending request', {
            cause: { status: 403, message: 'API key not valid' }
        });

        expectAppError(() => mapGeminiError(error), 403, 'AI_FORBIDDEN');
    });

    it('parses Gemini status from message', () => {
        expectAppError(
            () => mapGeminiError(new Error('404 models/gemini-custom is not found')),
            404,
            'AI_NOT_FOUND',
            'Модель Gemini не найдена или недоступна: models/gemini-custom is not found'
        );
    });

    it('parses Gemini status from JSON message', () => {
        expectAppError(
            () =>
                mapGeminiError(
                    new Error(
                        JSON.stringify({
                            error: {
                                code: 400,
                                message: 'User location is not supported for the API use.',
                                status: 'FAILED_PRECONDITION'
                            }
                        })
                    )
                ),
            400,
            'AI_INVALID_REQUEST',
            'Неверный запрос Gemini: {"error":{"code":400,"message":"User location is not supported for the API use.","status":"FAILED_PRECONDITION"}}'
        );
    });

    it('maps Gemini connection errors to AI_CONNECTION_ERROR', () => {
        expectAppError(
            () => mapGeminiError(new Error('fetch failed')),
            503,
            'AI_CONNECTION_ERROR',
            'Не удалось подключиться к Gemini API: fetch failed'
        );
    });

    it('maps unknown Gemini errors to AI_UNKNOWN_ERROR with diagnostics', () => {
        expectAppError(() => mapGeminiError(new Error('unexpected')), 500, 'AI_UNKNOWN_ERROR', 'Ошибка Gemini: unexpected');
    });
});
