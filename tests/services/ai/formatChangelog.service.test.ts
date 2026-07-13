import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MAX_CHANGELOG_INPUT_CHARS } from '@/constants/ai';
import { formatChangelog } from '@/services/ai/formatChangelog.service';

const { generateAIResponseMock } = vi.hoisted(() => ({
    generateAIResponseMock: vi.fn()
}));

vi.mock('@/services/ai/generateAIResponse.service', () => ({
    generateAIResponse: generateAIResponseMock
}));

interface GenerateAIResponseCall {
    input: string;
}

describe('formatChangelog', () => {
    const params = { owner: 'vercel', repo: 'next.js', tag: 'v14.0.0', changelog: 'Fixed cache bug\nAdded stable routing' };

    beforeEach(() => {
        generateAIResponseMock.mockReset();
    });

    it('renders markdown from valid structured JSON and appends release link locally', async () => {
        generateAIResponseMock.mockResolvedValueOnce(
            JSON.stringify({
                sections: [
                    {
                        title: 'Bug Fixes',
                        items: [{ text: 'Fixed cache bug', evidenceLines: [1] }]
                    },
                    {
                        title: 'New Features',
                        items: [{ text: 'Added stable routing', evidenceLines: [2] }]
                    }
                ]
            })
        );

        const result = await formatChangelog(params);

        expect(result).toEqual({
            changelog: [
                '## Bug Fixes',
                '- Fixed cache bug',
                '',
                '## New Features',
                '- Added stable routing',
                '',
                'Подробнее обо всех изменениях: [Release Notes](https://github.com/vercel/next.js/releases/tag/v14.0.0)'
            ].join('\n')
        });
    });

    it('returns null when OpenAI output is empty', async () => {
        generateAIResponseMock.mockResolvedValueOnce('');

        const result = await formatChangelog(params);

        expect(result).toBeNull();
    });

    it('returns null when OpenAI output is not JSON', async () => {
        generateAIResponseMock.mockResolvedValueOnce('## Bug Fixes\n- invented markdown');

        const result = await formatChangelog(params);

        expect(result).toBeNull();
    });

    it('returns null when structured output does not match schema', async () => {
        generateAIResponseMock.mockResolvedValueOnce(JSON.stringify({ sections: [{ title: 'Bug Fixes' }] }));

        const result = await formatChangelog(params);

        expect(result).toBeNull();
    });

    it('drops items with missing or out-of-range evidence and returns null when none remain', async () => {
        generateAIResponseMock.mockResolvedValueOnce(
            JSON.stringify({
                sections: [
                    {
                        title: 'Bug Fixes',
                        items: [{ text: 'Invented fix', evidenceLines: [3] }]
                    }
                ]
            })
        );

        const result = await formatChangelog(params);

        expect(result).toBeNull();
    });

    it('truncates changelog to configured limit and sends stable line numbers to OpenAI', async () => {
        const longChangelog = 'a'.repeat(MAX_CHANGELOG_INPUT_CHARS + 1000);
        generateAIResponseMock.mockResolvedValueOnce(
            JSON.stringify({
                sections: [
                    {
                        title: 'Other',
                        items: [{ text: 'Large release notes summarized', evidenceLines: [1] }]
                    }
                ]
            })
        );

        await formatChangelog({ ...params, changelog: longChangelog });

        const [generateAIResponseCall] = generateAIResponseMock.mock.calls[0] as unknown as [GenerateAIResponseCall];

        expect(generateAIResponseCall.input).toContain(`1: ${'a'.repeat(MAX_CHANGELOG_INPUT_CHARS)}`);
        expect(generateAIResponseCall.input).not.toContain('a'.repeat(MAX_CHANGELOG_INPUT_CHARS + 1));
    });
});
