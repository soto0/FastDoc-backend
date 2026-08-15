import { APIConnectionError, APIError } from 'openai';
import { AppError } from '@/utils/appError';

const statusPrefixRegex = /^\d{3}\s+/;
const statusFromMessageRegex = /\b(?<status>\d{3})\b/;
const connectionErrorRegex = /abort|connection|fetch failed|network|timeout|timed out|sending request/i;

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    if (!isRecord(error)) return '';

    const message = error.message;

    return typeof message === 'string' ? message : '';
};

const getNestedErrorMessage = (error: unknown): string => {
    const message = getErrorMessage(error);
    if (!isRecord(error)) return message;

    const causeMessage = getNestedErrorMessage(error.cause);

    if (message.length === 0) return causeMessage;
    if (causeMessage.length === 0 || causeMessage === message) return message;

    return `${message}: ${causeMessage}`;
};

const getErrorStatus = (error: unknown): number | undefined => {
    if (!isRecord(error)) return undefined;

    const status = error.status;
    if (typeof status === 'number') return status;

    const code = error.code;
    if (typeof code === 'number') return code;
    if (typeof code === 'string') {
        const parsedCode = Number.parseInt(code, 10);
        if (Number.isInteger(parsedCode)) return parsedCode;
    }

    const statusCode = error.statusCode;
    if (typeof statusCode === 'number') return statusCode;

    const response = error.response;
    if (isRecord(response)) {
        const responseStatus = response.status;
        if (typeof responseStatus === 'number') return responseStatus;
    }

    const messageStatusMatch = getNestedErrorMessage(error).match(statusFromMessageRegex);
    if (messageStatusMatch?.groups?.status != null) {
        const parsedMessageStatus = Number.parseInt(messageStatusMatch.groups.status, 10);
        if (Number.isInteger(parsedMessageStatus)) return parsedMessageStatus;
    }

    const cause = error.cause;
    const causeStatus = getErrorStatus(cause);
    if (causeStatus != null) return causeStatus;

    return undefined;
};

const buildProviderErrorMessage = (fallbackMessage: string, message: string): string => {
    const providerMessage = message.replace(statusPrefixRegex, '').trim();

    if (providerMessage.length === 0 || providerMessage === fallbackMessage) return fallbackMessage;

    return `${fallbackMessage}: ${providerMessage}`;
};

export const mapOpenAIError = (error: unknown): never => {
    if (error instanceof APIConnectionError) {
        throw new AppError(503, 'Не удалось подключиться к OpenAI API', 'AI_CONNECTION_ERROR');
    }

    if (error instanceof APIError) {
        switch (error.status) {
            case 400:
                throw new AppError(400, buildProviderErrorMessage('Неверный запрос OpenAI', error.message), 'AI_INVALID_REQUEST');
            case 401:
                throw new AppError(401, 'Неавторизованный запрос', 'AI_UNAUTHORIZED');
            case 403:
                throw new AppError(403, 'Нет доступа к ресурсу', 'AI_FORBIDDEN');
            case 404:
                throw new AppError(404, buildProviderErrorMessage('Модель OpenAI не найдена или недоступна', error.message), 'AI_NOT_FOUND');
            case 422:
                throw new AppError(422, 'Неверные данные', 'AI_INVALID_DATA');
            case 429:
                throw new AppError(429, buildProviderErrorMessage('Лимит OpenAI исчерпан', error.message), 'AI_TOO_MANY_REQUESTS');
            default:
                if (error.status != null && error.status >= 500) throw new AppError(500, 'Неизвестная ошибка', 'AI_UNKNOWN_ERROR');
        }
    }

    throw new AppError(500, 'Неизвестная ошибка', 'UNKNOWN_ERROR');
};

export const mapGeminiError = (error: unknown): never => {
    const status = getErrorStatus(error);
    const message = getNestedErrorMessage(error);

    if (status == null && connectionErrorRegex.test(message)) {
        throw new AppError(503, buildProviderErrorMessage('Не удалось подключиться к Gemini API', message), 'AI_CONNECTION_ERROR');
    }

    if (status == null) {
        throw new AppError(500, buildProviderErrorMessage('Ошибка Gemini', message), 'AI_UNKNOWN_ERROR');
    }

    switch (status) {
        case 400:
            throw new AppError(400, buildProviderErrorMessage('Неверный запрос Gemini', message), 'AI_INVALID_REQUEST');
        case 401:
            throw new AppError(401, 'Неавторизованный запрос', 'AI_UNAUTHORIZED');
        case 403:
            throw new AppError(403, 'Нет доступа к ресурсу', 'AI_FORBIDDEN');
        case 404:
            throw new AppError(404, buildProviderErrorMessage('Модель Gemini не найдена или недоступна', message), 'AI_NOT_FOUND');
        case 422:
            throw new AppError(422, 'Неверные данные', 'AI_INVALID_DATA');
        case 429:
            throw new AppError(429, buildProviderErrorMessage('Лимит Gemini исчерпан', message), 'AI_TOO_MANY_REQUESTS');
        default:
            if (status >= 500) throw new AppError(500, buildProviderErrorMessage('Gemini временно недоступен', message), 'AI_UNKNOWN_ERROR');
            throw new AppError(500, 'Неизвестная ошибка', 'UNKNOWN_ERROR');
    }
};
