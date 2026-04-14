import { afterEach, describe, expect, it, vi } from 'vitest';
import { formatChangelog } from '@/services/groq/formatChangelog.service';
import * as generateModule from '@/services/groq/generateAIResponse.service';

const completion = (content: string | null) =>
    ({
        id: 'id',
        object: 'chat.completion',
        created: 0,
        model: 'mock',
        choices: [{ index: 0, message: { role: 'assistant' as const, content }, finish_reason: 'stop' as const, logprobs: null }],
        usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 }
    }) as never;

afterEach(() => {
    vi.restoreAllMocks();
});

describe('formatChangelog', () => {
    it('возвращает текст ответа модели', async () => {
        vi.spyOn(generateModule, 'generateAIResponse').mockResolvedValueOnce(completion('## Итог'));

        await expect(
            formatChangelog({
                owner: 'fb',
                repo: 'react',
                version: '18.0.0',
                changelog: '# Notes'
            })
        ).resolves.toBe('## Итог');

        expect(generateModule.generateAIResponse).toHaveBeenCalledWith(
            expect.objectContaining({
                prompt: '# Notes',
                model: 'hard'
            })
        );
    });

    it('обрезает changelog до 8000 символов в prompt', async () => {
        const long = 'x'.repeat(9000);
        vi.spyOn(generateModule, 'generateAIResponse').mockResolvedValueOnce(completion('ok'));

        await formatChangelog({
            owner: 'a',
            repo: 'b',
            version: '1',
            changelog: long
        });

        const call = vi.mocked(generateModule.generateAIResponse).mock.calls[0]?.[0];
        expect(call?.prompt).toHaveLength(8000);
    });

    it('возвращает null если content отсутствует', async () => {
        vi.spyOn(generateModule, 'generateAIResponse').mockResolvedValueOnce(completion(null));

        await expect(
            formatChangelog({ owner: 'a', repo: 'b', version: '1', changelog: 'x' })
        ).resolves.toBeNull();
    });
});
