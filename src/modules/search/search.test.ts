import { describe, expect, it, vi } from 'vitest';
import app from '../../app';
import * as groqService from '../../services/groq/generateAIResponse.service';
import { AppError } from '../../utils/appError';
import { expectError } from '../../utils/test-helpers';

const mockChatCompletion = {
    id: 'mock-id',
    object: 'chat.completion',
    created: Date.now(),
    model: 'llama-3.3-70b-versatile',
    choices: [{ index: 0, message: { role: 'assistant', content: 'Mocked answer' }, finish_reason: 'stop', logprobs: null }],
    usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 }
};

const request = async (query: string) => {
    return app.request('/api/search', {
        method: 'POST',
        body: JSON.stringify({ query }),
        headers: new Headers({ 'Content-Type': 'application/json' })
    });
};

describe('search endpoint', () => {
    it('should return search result', async () => {
        vi.spyOn(groqService, 'generateAIResponse').mockResolvedValueOnce(mockChatCompletion as never);

        const res = await request('test search');
        expect(res.status).toBe(200);
        // eslint-disable-next-line ts/no-unsafe-assignment
        expect(await res.json()).toEqual({ answer: expect.any(String), success: true });
    });

    it('should return 400 when query is too short or empty', async () => {
        const res = await request('ab');
        await expectError(res, 400, 'Минимум 3 символа');
    });

    it('should return 500 when Groq API is down', async () => {
        vi.spyOn(groqService, 'generateAIResponse').mockImplementationOnce(() => {
            throw new AppError(500, 'Неизвестная ошибка', 'UNKNOWN_ERROR');
        });

        const res = await request('test search');
        await expectError(res, 500, 'Неизвестная ошибка');
    });

    it('should return 429 when Groq API is down', async () => {
        vi.spyOn(groqService, 'generateAIResponse').mockImplementationOnce(() => {
            throw new AppError(429, 'Слишком много запросов', 'AI_TOO_MANY_REQUESTS');
        });

        const res = await request('test search');
        await expectError(res, 429, 'Слишком много запросов');
    });
});
