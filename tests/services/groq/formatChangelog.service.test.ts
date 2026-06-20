import { mockGroqCompletion } from '@tests/helpers/testHelper';
import { describe, expect, it, vi } from 'vitest';
import { formatChangelog } from '@/services/groq/formatChangelog.service';

const { generateAIResponseMock } = vi.hoisted(() => ({
    generateAIResponseMock: vi.fn()
}));

vi.mock('@/services/groq/generateAIResponse.service', () => ({
    generateAIResponse: generateAIResponseMock
}));

describe('formatChangelog', () => {
    const params = { owner: 'vercel', repo: 'next.js', tag: 'v14.0.0', changelog: 'raw changelog' };

    it('returns formatted changelog when Groq responds with content', async () => {
        generateAIResponseMock.mockResolvedValueOnce(mockGroqCompletion('## Bug Fixes\n- fix'));

        const result = await formatChangelog(params);

        expect(result).toEqual({ changelog: '## Bug Fixes\n- fix' });
    });

    it('returns null when Groq response has no content', async () => {
        generateAIResponseMock.mockResolvedValueOnce(mockGroqCompletion(null));

        const result = await formatChangelog(params);

        expect(result).toBeNull();
    });

    it('truncates changelog to 8000 characters before sending to Groq', async () => {
        const longChangelog = 'a'.repeat(9000);
        generateAIResponseMock.mockResolvedValueOnce(mockGroqCompletion('formatted'));

        await formatChangelog({ ...params, changelog: longChangelog });

        expect(generateAIResponseMock).toHaveBeenCalledWith(expect.objectContaining({ prompt: 'a'.repeat(8000), model: 'hard' }));
    });
});
