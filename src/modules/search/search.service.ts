import { getChangelog } from '@/services/getChangelog.service';

export const searchService = async (query: string) => {
    return getChangelog(query);
};
