import { describe, expect, it } from 'vitest';
import { geminiProvider } from '@/services/ai/providers/gemini.provider';
import { openaiProvider } from '@/services/ai/providers/openai.provider';
import { resolveAIProvider } from '@/services/ai/providers/resolveAIProvider';
import { AppError } from '@/utils/appError';

describe('resolveAIProvider', () => {
    it('uses OpenAI provider by default', () => {
        expect(resolveAIProvider(undefined)).toBe(openaiProvider);
    });

    it('uses Gemini provider when AI_PROVIDER is gemini', () => {
        expect(resolveAIProvider({ AI_PROVIDER: 'gemini' })).toBe(geminiProvider);
    });

    it('normalizes provider value', () => {
        expect(resolveAIProvider({ AI_PROVIDER: ' openAI ' })).toBe(openaiProvider);
    });

    it('rejects unknown providers', () => {
        try {
            resolveAIProvider({ AI_PROVIDER: 'claude' });
            expect.fail('Expected AppError to be thrown');
        } catch (error) {
            expect(error).toBeInstanceOf(AppError);
            expect((error as AppError).status).toBe(400);
            expect((error as AppError).code).toBe('AI_INVALID_PROVIDER');
        }
    });
});
