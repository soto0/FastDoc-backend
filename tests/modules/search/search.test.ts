import { afterEach, describe, expect, it, vi } from 'vitest';
import app from '@/app';
import * as githubRelease from '@/services/github/getRelease.service';
import * as groqService from '@/services/groq/generateAIResponse.service';
import * as npmRegistry from '@/services/npmRegistry/getNpmLibraryMetadata';
import { AppError } from '@/utils/appError';
import { expectError } from '@tests/helpers/testHelper';

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
    it('returns formatted changelog string', async () => {
        vi.spyOn(groqService, 'generateAIResponse')
            .mockResolvedValueOnce(groqCompletion(JSON.stringify({ library: 'react', version: '18.0.0' })) as never)
            .mockResolvedValueOnce(groqCompletion('## React 18\n\nСводка изменений.') as never);
        vi.spyOn(npmRegistry, 'getNpmLibraryMetadata').mockResolvedValueOnce({
            version: '18.0.0',
            owner: 'facebook',
            repo: 'react'
        });
        vi.spyOn(githubRelease, 'getRelease').mockResolvedValueOnce('## Raw release notes');

        const res = await request('test search');
        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toEqual({
            changelog: '## React 18\n\nСводка изменений.',
            success: true
        });
    });

    it('resolves metadata when model returns null version', async () => {
        vi.spyOn(groqService, 'generateAIResponse')
            .mockResolvedValueOnce(groqCompletion(JSON.stringify({ library: 'lodash', version: null })) as never)
            .mockResolvedValueOnce(groqCompletion('## Lodash changelog') as never);
        vi.spyOn(npmRegistry, 'getNpmLibraryMetadata').mockResolvedValueOnce({
            version: '4.17.21',
            owner: 'lodash',
            repo: 'lodash'
        });
        vi.spyOn(githubRelease, 'getRelease').mockResolvedValueOnce('raw');

        const res = await request('lodash docs');
        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toEqual({
            changelog: '## Lodash changelog',
            success: true
        });
    });

    it('returns 400 when parseSearch cannot parse model output', async () => {
        vi.spyOn(groqService, 'generateAIResponse').mockResolvedValueOnce(groqCompletion('plain text') as never);

        const res = await request('test search');
        await expectError(res, 400, 'Не удалось получить информацию о библиотеке');
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
