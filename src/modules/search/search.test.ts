import { afterEach, describe, expect, it, vi } from 'vitest';
import app from '@/app';
import * as groqService from '@/services/groq/generateAIResponse.service';
import * as npmRegistry from '@/services/npmRegistry/getNpmLibraryMetadata';
import { AppError } from '@/utils/appError';
import { expectError } from '@/utils/testHelper';

const groqCompletion = (content: string) => ({
    id: 'mock-id',
    object: 'chat.completion',
    created: Date.now(),
    model: 'llama-3.3-70b-versatile',
    choices: [{ index: 0, message: { role: 'assistant' as const, content }, finish_reason: 'stop', logprobs: null }],
    usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 }
});

const request = async (query: string) => {
    return app.request('/api/search', {
        method: 'POST',
        body: JSON.stringify({ query }),
        headers: new Headers({ 'Content-Type': 'application/json' })
    });
};

afterEach(() => {
    vi.restoreAllMocks();
});

describe('search endpoint', () => {
    it('should return parsed library, version and repository', async () => {
        vi.spyOn(groqService, 'generateAIResponse').mockResolvedValueOnce(
            groqCompletion(JSON.stringify({ library: 'react', version: '18.0.0' })) as never
        );
        vi.spyOn(npmRegistry, 'getNpmLibraryMetadata').mockResolvedValueOnce({
            version: '18.0.0',
            repository: 'facebook/react'
        });

        const res = await request('test search');
        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toEqual({
            answer: {
                library: 'react',
                version: '18.0.0',
                repository: 'facebook/react'
            },
            success: true
        });
    });

    it('should resolve metadata when model returns null version', async () => {
        vi.spyOn(groqService, 'generateAIResponse').mockResolvedValueOnce(
            groqCompletion(JSON.stringify({ library: 'lodash', version: null })) as never
        );
        vi.spyOn(npmRegistry, 'getNpmLibraryMetadata').mockResolvedValueOnce({
            version: '4.17.21',
            repository: 'lodash/lodash'
        });

        const res = await request('lodash docs');
        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toEqual({
            answer: {
                library: 'lodash',
                version: '4.17.21',
                repository: 'lodash/lodash'
            },
            success: true
        });
    });

    it('should return null answer when model output is not valid JSON', async () => {
        vi.spyOn(groqService, 'generateAIResponse').mockResolvedValueOnce(groqCompletion('plain text') as never);

        const res = await request('test search');
        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toEqual({ answer: null, success: true });
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
