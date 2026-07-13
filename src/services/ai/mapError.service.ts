import { APIConnectionError, APIError } from 'openai';
import { AppError } from '@/utils/appError';

const statusPrefixRegex = /^\d{3}\s+/;

const buildOpenAIErrorMessage = (fallbackMessage: string, message: string): string => {
    const openAIMessage = message.replace(statusPrefixRegex, '').trim();

    if (openAIMessage.length === 0 || openAIMessage === fallbackMessage) return fallbackMessage;

    return `${fallbackMessage}: ${openAIMessage}`;
};

export const mapOpenAIError = (error: unknown): never => {
    if (error instanceof APIConnectionError) {
        throw new AppError(503, 'Не удалось подключиться к OpenAI API', 'AI_CONNECTION_ERROR');
    }

    if (error instanceof APIError) {
        switch (error.status) {
            case 400:
                throw new AppError(400, buildOpenAIErrorMessage('Неверный запрос OpenAI', error.message), 'AI_INVALID_REQUEST');
            case 401:
                throw new AppError(401, 'Неавторизованный запрос', 'AI_UNAUTHORIZED');
            case 403:
                throw new AppError(403, 'Нет доступа к ресурсу', 'AI_FORBIDDEN');
            case 404:
                throw new AppError(404, 'Ресурс не найден', 'AI_NOT_FOUND');
            case 422:
                throw new AppError(422, 'Неверные данные', 'AI_INVALID_DATA');
            case 429:
                throw new AppError(429, buildOpenAIErrorMessage('Лимит OpenAI исчерпан', error.message), 'AI_TOO_MANY_REQUESTS');
            default:
                if (error.status != null && error.status >= 500) throw new AppError(500, 'Неизвестная ошибка', 'AI_UNKNOWN_ERROR');
        }
    }

    throw new AppError(500, 'Неизвестная ошибка', 'UNKNOWN_ERROR');
};
