import type { ResponseCreateParamsNonStreaming } from 'openai/resources/responses/responses';
import type { AppBindings } from '@/types/AppEnv';
import { openaiClient } from '@/config/openai';
import { getRuntimeEnv } from '@/config/runtimeEnv';
import { CHANGELOG_RESPONSE_FORMAT, DEFAULT_OPENAI_MODEL, FORMAT_CHANGELOG_INSTRUCTIONS, MAX_CHANGELOG_OUTPUT_TOKENS } from '@/constants/ai';
import { mapOpenAIError } from '@/services/ai/mapError.service';

interface GenerateAIResponseParams {
    input: string;
    env?: AppBindings;
}

const getOpenAIModel = (env: AppBindings | undefined): string => getRuntimeEnv(env, 'OPENAI_MODEL') ?? DEFAULT_OPENAI_MODEL;

export const generateAIResponse = async ({ input, env }: GenerateAIResponseParams): Promise<string> => {
    const params: ResponseCreateParamsNonStreaming = {
        model: getOpenAIModel(env),
        instructions: FORMAT_CHANGELOG_INSTRUCTIONS,
        input,
        reasoning: { effort: 'low' },
        max_output_tokens: MAX_CHANGELOG_OUTPUT_TOKENS,
        text: {
            format: CHANGELOG_RESPONSE_FORMAT
        }
    };

    try {
        const response = await openaiClient(getRuntimeEnv(env, 'OPENAI_API_KEY')).responses.create(params);

        return response.output_text;
    } catch (error) {
        throw mapOpenAIError(error);
    }
};
