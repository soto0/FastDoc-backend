import { PARSE_SEARCH_PROMPT } from '@/constants/groq';
import { generateAIResponse } from '@/services/groq/generateAIResponse.service';
import { getNpmLibraryMetadata } from '../npmRegistry/getNpmLibraryMetadata';

interface IParsedSearch {
    library: string;
    version: string;
    repository: string;
}

export const parseSearch = async (query: string): Promise<IParsedSearch | null> => {
    const response = await generateAIResponse({ systemPrompt: PARSE_SEARCH_PROMPT, prompt: query, model: 'easy' });

    const content = response.choices[0]?.message.content;
    if (content == null) return null;

    try {
        const parsedContent = JSON.parse(content) as IParsedSearch;
        if (!parsedContent.library) return null;

        const { version, repository } = await getNpmLibraryMetadata({ library: parsedContent.library, version: parsedContent.version });
        return { ...parsedContent, version, repository };
    } catch {
        return null;
    }
};
