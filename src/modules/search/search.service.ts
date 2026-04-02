import type { ChatCompletion } from 'groq-sdk/resources/chat.mjs';
import { generateAIResponse } from '../../services/groq/generateAIResponse.service';

export const searchService = async (query: string): Promise<ChatCompletion> => {
    const response = await generateAIResponse(query);
    return response;
};
