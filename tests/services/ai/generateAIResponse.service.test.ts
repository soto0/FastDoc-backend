import { beforeEach, describe, expect, it, vi } from 'vitest';
import { generateAIResponse } from '@/services/ai/generateAIResponse.service';

const { generateMock, resolveAIProviderMock } = vi.hoisted(() => ({
    generateMock: vi.fn(),
    resolveAIProviderMock: vi.fn()
}));

vi.mock('@/services/ai/providers/resolveAIProvider', () => ({
    resolveAIProvider: resolveAIProviderMock
}));

describe('generateAIResponse', () => {
    beforeEach(() => {
        generateMock.mockReset();
        resolveAIProviderMock.mockReset();
    });

    it('delegates generation to the selected AI provider', async () => {
        generateMock.mockResolvedValueOnce('{"sections":[]}');
        resolveAIProviderMock.mockReturnValueOnce({ generate: generateMock });

        const env = { AI_PROVIDER: 'gemini' as const };
        const result = await generateAIResponse({ input: 'numbered changelog', env });

        expect(result).toBe('{"sections":[]}');
        expect(resolveAIProviderMock).toHaveBeenCalledWith(env);
        expect(generateMock).toHaveBeenCalledWith('numbered changelog', env);
    });
});
