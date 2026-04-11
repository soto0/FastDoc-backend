import { parseSearch } from '@/services/groq/parseSearch.sevice';

export const searchService = async (query: string) => {
    const response = await parseSearch(query);
    return response;
};
