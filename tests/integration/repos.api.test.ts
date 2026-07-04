import { expectError, mockGithubRelease, mockGithubRepos, mockGroqCompletion } from '@tests/helpers/testHelper';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/* eslint-disable ts/no-unsafe-assignment */

import app from '@/app';

const { requestMock, createMock } = vi.hoisted(() => ({
    requestMock: vi.fn(),
    createMock: vi.fn()
}));

vi.mock('@/config/githubClient', () => ({
    githubClient: () => ({
        request: requestMock
    })
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

describe('repos API', () => {
    beforeEach(() => {
        requestMock.mockReset();
        createMock.mockReset();
    });

    describe('gET /api/repos/search', () => {
        it('returns 400 when query is too short', async () => {
            const res = await app.request('/api/repos/search?query=ab');

            await expectError(res, 400, 'Минимум 3 символа');
        });

        it('returns repositories on success', async () => {
            requestMock.mockResolvedValueOnce(mockGithubRepos([{ id: 1, name: 'next.js', owner: { login: 'vercel' } }]));

            const res = await app.request('/api/repos/search?query=next-api-1');

            expect(res.status).toBe(200);

            const data = await res.json();
            expect(data).toEqual({
                payload: [{ id: 1, repo: 'next.js', owner: 'vercel' }],
                meta: { success: true }
            });
        });

        it('returns 404 when GitHub has no results', async () => {
            requestMock.mockResolvedValueOnce(mockGithubRepos());

            const res = await app.request('/api/repos/search?query=empty-api-1');

            const data = await expectError(res, 404, 'Репозитории не найдены');
            expect(data).toMatchObject({ code: 'REPOS_NOT_FOUND' });
        });
    });

    describe('gET /api/repos/releases', () => {
        it('returns 400 when owner is missing', async () => {
            const res = await app.request('/api/repos/releases?repo=next.js');

            await expectError(res, 400);
        });

        it('returns 400 when repo is missing', async () => {
            const res = await app.request('/api/repos/releases?owner=vercel');

            await expectError(res, 400);
        });

        it('returns releases with pagination meta', async () => {
            requestMock.mockResolvedValueOnce({
                data: [mockGithubRelease({ id: 10, tag_name: 'v1.0.0', name: 'Release 1.0.0' })],
                headers: { link: '<https://api.github.com/repos/vercel/next.js/releases?page=2>; rel="next"' }
            });

            const res = await app.request('/api/repos/releases?owner=vercel&repo=next-api-1&page=1');

            expect(res.status).toBe(200);

            const data = await res.json();
            expect(data).toEqual({
                payload: [{ id: 10, tag: 'v1.0.0', name: 'Release 1.0.0' }],
                meta: { success: true, hasMore: true }
            });
        });

        it('defaults page to 1 when page param is omitted', async () => {
            requestMock.mockResolvedValueOnce({
                data: [mockGithubRelease({ id: 11, tag_name: 'v2.0.0' })],
                headers: {}
            });

            const res = await app.request('/api/repos/releases?owner=vercel&repo=react-api-1');

            expect(res.status).toBe(200);
            expect(requestMock).toHaveBeenCalledWith('GET /repos/{owner}/{repo}/releases', {
                owner: 'vercel',
                repo: 'react-api-1',
                page: 1,
                per_page: 20
            });
        });
    });

    describe('gET /api/repos/changelog', () => {
        it('returns 400 when tag is missing', async () => {
            const res = await app.request('/api/repos/changelog?owner=vercel&repo=next.js');

            await expectError(res, 400);
        });

        it('returns formatted changelog on success', async () => {
            requestMock.mockResolvedValueOnce({
                data: { body: 'raw changelog content' }
            });
            createMock.mockResolvedValueOnce(mockGroqCompletion('## Bug Fixes\n- fixed issue'));

            const res = await app.request('/api/repos/changelog?owner=vercel&repo=next.js&tag=v14-api-1');

            expect(res.status).toBe(200);

            const data = await res.json();
            expect(data).toEqual({
                payload: { changelog: '## Bug Fixes\n- fixed issue' },
                meta: { success: true }
            });
        });

        it('returns 404 when release body is null', async () => {
            requestMock.mockResolvedValueOnce({ data: { body: null } });

            const res = await app.request('/api/repos/changelog?owner=vercel&repo=next.js&tag=v14-api-2');

            const data = await expectError(res, 404, 'Changelog не найден');
            expect(data).toMatchObject({ code: 'CHANGELOG_NOT_FOUND' });
        });
    });
});
