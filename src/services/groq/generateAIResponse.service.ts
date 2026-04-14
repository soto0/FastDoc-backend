import type { ChatCompletion, ChatCompletionCreateParams } from 'groq-sdk/resources/chat/completions.mjs';
import { groqClient } from '@/config/groq';
import { EASY_GROQ_MODEL, HARD_GROQ_MODEL } from '@/constants/groq';
import { mapGroqError } from '@/services/groq/mapError.service';

interface GenerateAIResponseParams {
    systemPrompt: string;
    prompt: string;
    model: 'easy' | 'hard';
}

const modelMap: Record<GenerateAIResponseParams['model'], string> = {
    easy: EASY_GROQ_MODEL,
    hard: HARD_GROQ_MODEL
};

export const generateAIResponse = async ({ systemPrompt, prompt, model }: GenerateAIResponseParams): Promise<ChatCompletion> => {
    const params: ChatCompletionCreateParams = {
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
        ],
        model: modelMap[model]
    };

    try {
        return await groqClient().chat.completions.create(params);
    } catch (error) {
        throw mapGroqError(error);
    }
};
