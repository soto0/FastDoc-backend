import { mockOpenAIResponse } from '@tests/helpers/testHelper';
import { APIError } from 'openai';
import { describe, expect, it, vi } from 'vitest';
import { CHANGELOG_RESPONSE_FORMAT, FORMAT_CHANGELOG_INSTRUCTIONS, MAX_CHANGELOG_OUTPUT_TOKENS } from '@/constants/ai';
import { generateAIResponse } from '@/services/ai/generateAIResponse.service';

const { createMock } = vi.hoisted(() => ({
    createMock: vi.fn()
}));

vi.mock('@/config/openai', () => ({
    openaiClient: () => ({
        responses: {
            create: createMock
        }
    })
}));

describe('generateAIResponse', () => {
    it('calls OpenAI Responses API with strict changelog formatting params', async () => {
        const response = mockOpenAIResponse('{"sections":[]}');
        createMock.mockResolvedValueOnce(response);

        const result = await generateAIResponse({
            input: 'numbered changelog',
            env: {
                OPENAI_MODEL: 'gpt-5.6-luna'
            }
        });

        expect(result).toBe('{"sections":[]}');
        expect(createMock).toHaveBeenCalledWith({
            model: 'gpt-5.6-luna',
            instructions: FORMAT_CHANGELOG_INSTRUCTIONS,
            input: 'numbered changelog',
            reasoning: { effort: 'low' },
            max_output_tokens: MAX_CHANGELOG_OUTPUT_TOKENS,
            text: {
                format: CHANGELOG_RESPONSE_FORMAT
            }
        });
    });

    it('maps OpenAI errors to AppError', async () => {
        createMock.mockRejectedValueOnce(new APIError(429, undefined, 'rate limited', undefined));

        await expect(generateAIResponse({ input: 'prompt' })).rejects.toMatchObject({
            status: 429,
            code: 'AI_TOO_MANY_REQUESTS'
        });
    });
});
