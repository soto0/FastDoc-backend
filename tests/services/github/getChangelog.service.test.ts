import { describe, expect, it, vi } from 'vitest';
import { getChangelog } from '@/services/github/getChangelog.service';

const { requestMock } = vi.hoisted(() => ({
    requestMock: vi.fn()
}));

vi.mock('@/config/githubClient', () => ({
    default: {
        request: requestMock
    }
}));

describe('getChangelog', () => {
    it('returns release body from GitHub', async () => {
        requestMock.mockResolvedValueOnce({
            data: { body: '## Bug Fixes\n- fixed something' }
        });

        const result = await getChangelog({ owner: 'vercel', repo: 'next.js', tag: 'v14.0.0' });

        expect(result).toBe('## Bug Fixes\n- fixed something');
    });

    it('passes owner, repo, and tag to Octokit', async () => {
        requestMock.mockResolvedValueOnce({ data: { body: null } });

        await getChangelog({ owner: 'facebook', repo: 'react', tag: 'v18.0.0' });

        expect(requestMock).toHaveBeenCalledWith('GET /repos/{owner}/{repo}/releases/tags/{tag}', {
            owner: 'facebook',
            repo: 'react',
            tag: 'v18.0.0'
        });
    });
});
