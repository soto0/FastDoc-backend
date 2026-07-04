import type { ChatCompletion, ChatCompletionCreateParams } from 'groq-sdk/resources/chat/completions.mjs';
import type { AppBindings } from '@/types/AppEnv';
import { groqClient } from '@/config/groq';
import { getRuntimeEnv } from '@/config/runtimeEnv';
import { EASY_GROQ_MODEL, HARD_GROQ_MODEL } from '@/constants/groq';
import { mapGroqError } from '@/services/groq/mapError.service';

interface GenerateAIResponseParams {
    systemPrompt: string;
    prompt: string;
    model: 'easy' | 'hard';
    env?: AppBindings;
}

const modelMap: Record<GenerateAIResponseParams['model'], string> = {
    easy: EASY_GROQ_MODEL,
    hard: HARD_GROQ_MODEL
};

export const generateAIResponse = async ({ systemPrompt, prompt, model, env }: GenerateAIResponseParams): Promise<ChatCompletion> => {
    const params: ChatCompletionCreateParams = {
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
        ],
        model: modelMap[model]
    };

    try {
        return await groqClient(getRuntimeEnv(env, 'GROQ_API_KEY')).chat.completions.create(params);
    } catch (error) {
        throw mapGroqError(error);
    }
};
