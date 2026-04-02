import type { ChatCompletion, ChatCompletionCreateParams } from 'groq-sdk/resources/chat/completions.mjs';
import { groqClient } from '../../config/groq';
import { GROQ_MODEL, SYSTEM_PROMPT } from '../../constants/groq';
import { mapGroqError } from './mapError.service';

export const generateAIResponse = async (prompt: string): Promise<ChatCompletion> => {
    const params: ChatCompletionCreateParams = {
        messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: prompt }
        ],
        model: GROQ_MODEL
    };

    return groqClient()
        .chat.completions.create(params)
        .catch((error) => mapGroqError(error));
};
