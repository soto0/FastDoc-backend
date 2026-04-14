import { describe, expect, it } from 'vitest';
import { AppError } from '@/utils/appError';
import { resolveRepository } from '@/utils/resolveRepository';

describe('resolveRepository', () => {
    it('возвращает owner и repo из github url npm', () => {
        expect(resolveRepository({ url: 'git+https://github.com/foo/some-pkg.git' })).toEqual({
            owner: 'foo',
            repo: 'some-pkg'
        });
    });

    it('обрабатывает url без git+ префикса', () => {
        expect(resolveRepository({ url: 'https://github.com/acme/pkg' })).toEqual({
            owner: 'acme',
            repo: 'pkg'
        });
    });

    it('бросает AppError если repo отсутствует', () => {
        try {
            resolveRepository(null as never);
            expect.fail('ожидалось исключение');
        } catch (e) {
            expect(e).toBeInstanceOf(AppError);
            expect(e).toMatchObject({ status: 400, code: 'RESOLVE_REPOSITORY_ERROR' });
        }
    });
});
