import type { AppBindings } from '@/types/AppEnv';
import type { IChangelog } from '@/types/IChangelog';
import { getChangelog } from '@/services/github/getChangelog.service';
import { formatChangelog } from '@/services/groq/formatChangelog.service';
import { AppError } from '@/utils/appError';
import { cacheClient } from '@/utils/cacheClient';

interface ChangelogServiceParams {
    repo: string;
    owner: string;
    tag: string;
}

export const changelogService = cacheClient(
    async (params: ChangelogServiceParams, env?: AppBindings): Promise<IChangelog> => {
        const response = await getChangelog(params, env);

        if (response == null) throw new AppError(404, 'Changelog не найден', 'CHANGELOG_NOT_FOUND');

        const changelog = await formatChangelog({ ...params, changelog: response, env });

        if (changelog == null) {
            throw new AppError(400, 'Не удалось отформатировать changelog', 'FORMAT_CHANGELOG_ERROR');
        }

        return changelog;
    },
    { ttl: 1000 * 60 * 5, keyFn: ({ repo, owner, tag }, _env?: AppBindings) => `${repo}/${owner}/${tag}`.toLowerCase().trim() }
);
