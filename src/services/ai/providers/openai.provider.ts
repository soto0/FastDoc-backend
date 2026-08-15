import type { ResponseCreateParamsNonStreaming, ResponseFormatTextJSONSchemaConfig } from 'openai/resources/responses/responses';
import type { AIProvider } from '@/services/ai/providers/types';
import type { AppBindings } from '@/types/AppEnv';
import { openaiClient } from '@/config/ai/openai';
import { getRuntimeEnv } from '@/config/runtimeEnv';
import {
    AI_REQUEST_TIMEOUT_MS,
    CHANGELOG_RESPONSE_SCHEMA,
    CHANGELOG_RESPONSE_SCHEMA_NAME,
    DEFAULT_OPENAI_MODEL,
    FORMAT_CHANGELOG_INSTRUCTIONS,
    MAX_CHANGELOG_OUTPUT_TOKENS
} from '@/constants/ai';
import { mapOpenAIError } from '@/services/ai/mapError.service';

const changelogResponseFormat: ResponseFormatTextJSONSchemaConfig = {
    type: 'json_schema',
    name: CHANGELOG_RESPONSE_SCHEMA_NAME,
    strict: true,
    schema: CHANGELOG_RESPONSE_SCHEMA
};

const getOpenAIModel = (env: AppBindings | undefined): string => getRuntimeEnv(env, 'OPENAI_MODEL') ?? DEFAULT_OPENAI_MODEL;

export const openaiProvider: AIProvider = {
    generate: async (input, env) => {
        const params: ResponseCreateParamsNonStreaming = {
            model: getOpenAIModel(env),
            instructions: FORMAT_CHANGELOG_INSTRUCTIONS,
            input,
            reasoning: { effort: 'low' },
            max_output_tokens: MAX_CHANGELOG_OUTPUT_TOKENS,
            text: {
                format: changelogResponseFormat
            }
        };

        try {
            const response = await openaiClient(getRuntimeEnv(env, 'OPENAI_API_KEY')).responses.create(params, {
                maxRetries: 0,
                timeout: AI_REQUEST_TIMEOUT_MS
            });

            return response.output_text;
        } catch (error) {
            throw mapOpenAIError(error);
        }
    }
};
