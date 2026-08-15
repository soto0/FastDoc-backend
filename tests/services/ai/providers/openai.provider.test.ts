import { mockOpenAIResponse } from '@tests/helpers/testHelper';
import { APIError } from 'openai';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    AI_REQUEST_TIMEOUT_MS,
    CHANGELOG_RESPONSE_SCHEMA,
    CHANGELOG_RESPONSE_SCHEMA_NAME,
    FORMAT_CHANGELOG_INSTRUCTIONS,
    MAX_CHANGELOG_OUTPUT_TOKENS
} from '@/constants/ai';
import { openaiProvider } from '@/services/ai/providers/openai.provider';

const { createMock, openaiClientMock } = vi.hoisted(() => ({
    createMock: vi.fn(),
    openaiClientMock: vi.fn()
}));

vi.mock('@/config/ai/openai', () => ({
    openaiClient: openaiClientMock
}));

describe('openaiProvider', () => {
    beforeEach(() => {
        createMock.mockReset();
        openaiClientMock.mockReset();
        openaiClientMock.mockReturnValue({
            responses: {
                create: createMock
            }
        });
    });

    it('calls OpenAI Responses API with strict changelog formatting params', async () => {
        createMock.mockResolvedValueOnce(mockOpenAIResponse('{"sections":[]}'));

        const result = await openaiProvider.generate('numbered changelog', {
            OPENAI_API_KEY: 'test-openai-key',
            OPENAI_MODEL: 'gpt-5.6-luna'
        });

        expect(result).toBe('{"sections":[]}');
        expect(openaiClientMock).toHaveBeenCalledWith('test-openai-key');
        expect(createMock).toHaveBeenCalledWith(
            {
                model: 'gpt-5.6-luna',
                instructions: FORMAT_CHANGELOG_INSTRUCTIONS,
                input: 'numbered changelog',
                reasoning: { effort: 'low' },
                max_output_tokens: MAX_CHANGELOG_OUTPUT_TOKENS,
                text: {
                    format: {
                        type: 'json_schema',
                        name: CHANGELOG_RESPONSE_SCHEMA_NAME,
                        strict: true,
                        schema: CHANGELOG_RESPONSE_SCHEMA
                    }
                }
            },
            {
                maxRetries: 0,
                timeout: AI_REQUEST_TIMEOUT_MS
            }
        );
    });

    it('maps OpenAI errors to AppError', async () => {
        createMock.mockRejectedValueOnce(new APIError(429, undefined, 'rate limited', undefined));

        await expect(openaiProvider.generate('prompt')).rejects.toMatchObject({
            status: 429,
            code: 'AI_TOO_MANY_REQUESTS'
        });
    });
});
