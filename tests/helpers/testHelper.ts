/* eslint-disable ts/no-unsafe-return */
/* eslint-disable ts/no-unsafe-member-access */
/* eslint-disable ts/no-unsafe-assignment */
import type { ChatCompletion } from 'groq-sdk/resources/chat/completions.mjs';
import { expect } from 'vitest';

export const expectError = async (res: Response, expectedStatus: number, expectedError?: string) => {
    expect(res.status).toBe(expectedStatus);

    const data = await res.json();

    expect(data).toMatchObject({ success: false });

    const errorPayload = data.error as unknown;
    const errorText =
        typeof errorPayload === 'string'
            ? errorPayload
            : errorPayload != null && typeof errorPayload === 'object' && 'message' in errorPayload
              ? String(errorPayload.message)
              : JSON.stringify(errorPayload);

    if (expectedError != null) {
        expect(errorText).toContain(expectedError);
    }

    return data;
};

interface GithubRepoItem {
    id: number;
    name: string;
    owner: { login: string };
}

export const mockGithubRepos = (items: GithubRepoItem[] = []) => ({
    data: { items }
});

interface GithubReleaseOverrides {
    id?: number;
    tag_name?: string;
    name?: string | null;
    prerelease?: boolean;
}

export const mockGithubRelease = (overrides: GithubReleaseOverrides = {}) => ({
    id: overrides.id ?? 1,
    tag_name: overrides.tag_name ?? 'v1.0.0',
    name: overrides.name ?? 'Release 1.0.0',
    prerelease: overrides.prerelease ?? false
});

export const mockGroqCompletion = (content: string | null): ChatCompletion => ({
    id: 'chatcmpl-test',
    object: 'chat.completion',
    created: 0,
    model: 'llama-3.3-70b-versatile',
    choices: [
        {
            index: 0,
            message: { role: 'assistant', content },
            finish_reason: 'stop',
            logprobs: null
        }
    ],
    usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 }
});
