import { AppError } from '@/utils/appError';
import { getRelease } from './github/getRelease.service';
import { formatChangelog } from './groq/formatChangelog.service';
import { parseSearch } from './groq/parseSearch.service';

export const getChangelog = async (query: string): Promise<string> => {
    const parsedSearch = await parseSearch(query);

    if (parsedSearch == null) {
        throw new AppError(400, 'Не удалось получить информацию о библиотеке', 'PARSE_SEARCH_ERROR');
    }

    const changelog = await getRelease({ owner: parsedSearch.owner, repo: parsedSearch.repo, version: parsedSearch.version });

    if (changelog == null) {
        throw new AppError(400, 'Не удалось получить changelog', 'GET_CHANGELOG_ERROR');
    }

    const formattedChangelog = await formatChangelog({
        owner: parsedSearch.owner,
        repo: parsedSearch.repo,
        version: parsedSearch.version,
        changelog
    });

    if (formattedChangelog == null) {
        throw new AppError(400, 'Не удалось отформатировать changelog', 'FORMAT_CHANGELOG_ERROR');
    }

    return formattedChangelog;
};
