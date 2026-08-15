import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    AI_REQUEST_TIMEOUT_MS,
    CHANGELOG_RESPONSE_SCHEMA,
    FORMAT_CHANGELOG_INSTRUCTIONS,
    GEMINI_FALLBACK_MODELS,
    MAX_CHANGELOG_OUTPUT_TOKENS
} from '@/constants/ai';
import { geminiProvider } from '@/services/ai/providers/gemini.provider';

const { geminiClientMock, generateContentMock } = vi.hoisted(() => ({
    geminiClientMock: vi.fn(),
    generateContentMock: vi.fn()
}));

vi.mock('@/config/ai/gemini', () => ({
    geminiClient: geminiClientMock
}));

describe('geminiProvider', () => {
    beforeEach(() => {
        geminiClientMock.mockReset();
        generateContentMock.mockReset();
        geminiClientMock.mockReturnValue({
            models: {
                generateContent: generateContentMock
            }
        });
    });

    it('calls Gemini generateContent with JSON schema params', async () => {
        generateContentMock.mockResolvedValueOnce({ text: '{"sections":[]}' });

        const result = await geminiProvider.generate('numbered changelog', {
            GEMINI_API_KEY: 'test-gemini-key',
            GEMINI_MODEL: 'gemini-custom'
        });

        expect(result).toBe('{"sections":[]}');
        expect(geminiClientMock).toHaveBeenCalledWith('test-gemini-key');
        expect(generateContentMock).toHaveBeenCalledWith({
            model: 'gemini-custom',
            contents: 'numbered changelog',
            config: {
                systemInstruction: FORMAT_CHANGELOG_INSTRUCTIONS,
                responseMimeType: 'application/json',
                responseJsonSchema: CHANGELOG_RESPONSE_SCHEMA,
                temperature: 0,
                maxOutputTokens: MAX_CHANGELOG_OUTPUT_TOKENS,
                httpOptions: {
                    timeout: AI_REQUEST_TIMEOUT_MS
                }
            }
        });
    });

    it('returns an empty string when Gemini response text is missing', async () => {
        generateContentMock.mockResolvedValueOnce({});

        await expect(geminiProvider.generate('prompt')).resolves.toBe('');
    });

    it('retries with fallback models when Gemini primary model is temporarily unavailable', async () => {
        generateContentMock.mockRejectedValueOnce({ status: 503, message: 'high demand' });
        generateContentMock.mockResolvedValueOnce({ text: '{"sections":[]}' });

        await expect(
            geminiProvider.generate('numbered changelog', {
                GEMINI_MODEL: 'gemini-primary'
            })
        ).resolves.toBe('{"sections":[]}');

        expect(generateContentMock).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                model: 'gemini-primary'
            })
        );
        expect(generateContentMock).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                model: GEMINI_FALLBACK_MODELS[0]
            })
        );
    });

    it('does not retry non-retryable Gemini errors', async () => {
        generateContentMock.mockRejectedValueOnce({ status: 404, message: 'model not found' });

        await expect(geminiProvider.generate('prompt')).rejects.toMatchObject({
            status: 404,
            code: 'AI_NOT_FOUND'
        });
        expect(generateContentMock).toHaveBeenCalledTimes(1);
    });

    it('maps Gemini errors to AppError', async () => {
        generateContentMock.mockRejectedValueOnce({ status: 429, message: 'quota exceeded' });

        await expect(geminiProvider.generate('prompt')).rejects.toMatchObject({
            status: 429,
            code: 'AI_TOO_MANY_REQUESTS'
        });
    });
});
