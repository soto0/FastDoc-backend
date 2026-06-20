import { mockGroqCompletion } from '@tests/helpers/testHelper';
import { APIError } from 'groq-sdk';
import { describe, expect, it, vi } from 'vitest';
import { generateAIResponse } from '@/services/groq/generateAIResponse.service';

const { createMock } = vi.hoisted(() => ({
    createMock: vi.fn()
}));

vi.mock('@/config/groq', () => ({
    groqClient: () => ({
        chat: {
            completions: {
                create: createMock
            }
        }
    })
}));

describe('generateAIResponse', () => {
    it('calls Groq chat completions with mapped model', async () => {
        const completion = mockGroqCompletion('response');
        createMock.mockResolvedValueOnce(completion);

        const result = await generateAIResponse({
            systemPrompt: 'system',
            prompt: 'user prompt',
            model: 'hard'
        });

        expect(result).toBe(completion);
        expect(createMock).toHaveBeenCalledWith({
            messages: [
                { role: 'system', content: 'system' },
                { role: 'user', content: 'user prompt' }
            ],
            model: 'llama-3.3-70b-versatile'
        });
    });

    it('maps Groq errors to AppError', async () => {
        createMock.mockRejectedValueOnce(new APIError(429, undefined, 'rate limited', undefined));

        await expect(generateAIResponse({ systemPrompt: 'system', prompt: 'prompt', model: 'easy' })).rejects.toMatchObject({
            status: 429,
            code: 'AI_TOO_MANY_REQUESTS'
        });
    });
});
