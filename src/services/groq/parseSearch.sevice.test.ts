import { afterEach, describe, expect, it, vi } from 'vitest';
import * as generateModule from '@/services/groq/generateAIResponse.service';
import { parseSearch } from '@/services/groq/parseSearch.sevice';
import * as npmModule from '@/services/npmRegistry/getLatestLibraryVersion.service';

const groqPayload = (content: string | null) => ({
    id: 'id',
    object: 'chat.completion',
    created: 0,
    model: 'mock',
    choices: [
        {
            index: 0,
            message: { role: 'assistant' as const, content },
            finish_reason: 'stop' as const,
            logprobs: null
        }
    ],
    usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 }
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('parseSearch', () => {
    it('returns library and version from model JSON', async () => {
        vi.spyOn(generateModule, 'generateAIResponse').mockResolvedValueOnce(
            groqPayload(JSON.stringify({ library: 'react', version: '18.0.0' })) as never
        );

        await expect(parseSearch('react 18')).resolves.toEqual({
            library: 'react',
            version: '18.0.0'
        });
    });

    it('fills version from npm when model returns null version', async () => {
        vi.spyOn(generateModule, 'generateAIResponse').mockResolvedValueOnce(
            groqPayload(JSON.stringify({ library: 'lodash', version: null })) as never
        );
        vi.spyOn(npmModule, 'getLatestLibraryVersion').mockResolvedValueOnce({ version: '4.17.21' });

        await expect(parseSearch('lodash')).resolves.toEqual({
            library: 'lodash',
            version: '4.17.21'
        });
        expect(npmModule.getLatestLibraryVersion).toHaveBeenCalledWith('lodash');
    });

    it('returns null when message content is missing', async () => {
        vi.spyOn(generateModule, 'generateAIResponse').mockResolvedValueOnce(groqPayload(null) as never);

        await expect(parseSearch('x')).resolves.toBeNull();
    });

    it('returns null on invalid JSON', async () => {
        vi.spyOn(generateModule, 'generateAIResponse').mockResolvedValueOnce(groqPayload('not json') as never);

        await expect(parseSearch('x')).resolves.toBeNull();
    });

    it('returns null when library is empty', async () => {
        vi.spyOn(generateModule, 'generateAIResponse').mockResolvedValueOnce(groqPayload(JSON.stringify({ library: '', version: '1.0.0' })) as never);

        await expect(parseSearch('x')).resolves.toBeNull();
    });

    it('returns null when npm lookup throws', async () => {
        vi.spyOn(generateModule, 'generateAIResponse').mockResolvedValueOnce(
            groqPayload(JSON.stringify({ library: 'nope', version: null })) as never
        );
        vi.spyOn(npmModule, 'getLatestLibraryVersion').mockRejectedValueOnce(new Error('network'));

        await expect(parseSearch('nope')).resolves.toBeNull();
    });
});
