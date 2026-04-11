import { PARSE_SEARCH_PROMPT } from '@/constants/groq';
import { generateAIResponse } from '@/services/groq/generateAIResponse.service';
import { getLatestLibraryVersion } from '../npmRegistry/getLatestLibraryVersion.service';

interface IParsedSearch {
    library: string;
    version: string | null;
}

export const parseSearch = async (query: string): Promise<IParsedSearch | null> => {
    const response = await generateAIResponse({ systemPrompt: PARSE_SEARCH_PROMPT, prompt: query, model: 'easy' });

    const content = response.choices[0]?.message.content;
    if (content == null) return null;

    try {
        const parsedContent = JSON.parse(content) as IParsedSearch;
        if (!parsedContent.library) return null;

        if (parsedContent.version == null) {
            const { version } = await getLatestLibraryVersion(parsedContent.library);
            parsedContent.version = version;
        }

        return parsedContent;
    } catch {
        return null;
    }
};
