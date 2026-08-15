import type { AIProvider } from '@/services/ai/providers/types';
import type { AppBindings } from '@/types/AppEnv';
import { geminiClient } from '@/config/ai/gemini';
import { getRuntimeEnv } from '@/config/runtimeEnv';
import {
    AI_REQUEST_TIMEOUT_MS,
    CHANGELOG_RESPONSE_SCHEMA,
    DEFAULT_GEMINI_MODEL,
    FORMAT_CHANGELOG_INSTRUCTIONS,
    GEMINI_FALLBACK_MODELS,
    MAX_CHANGELOG_OUTPUT_TOKENS
} from '@/constants/ai';
import { mapGeminiError } from '@/services/ai/mapError.service';

const getGeminiModel = (env: AppBindings | undefined): string => getRuntimeEnv(env, 'GEMINI_MODEL') ?? DEFAULT_GEMINI_MODEL;
const retryableGeminiErrorRegex = /high demand|temporarily|unavailable/i;

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const getErrorStatus = (error: unknown): number | undefined => {
    if (!isRecord(error)) return undefined;

    const status = error.status;

    return typeof status === 'number' ? status : undefined;
};

const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    if (!isRecord(error)) return '';

    const message = error.message;

    return typeof message === 'string' ? message : '';
};

const isRetryableGeminiError = (error: unknown): boolean => {
    const message = getErrorMessage(error);

    return getErrorStatus(error) === 503 || retryableGeminiErrorRegex.test(message);
};

const getGeminiModels = (env: AppBindings | undefined): string[] => {
    const models = [getGeminiModel(env), ...GEMINI_FALLBACK_MODELS];

    return models.filter((model, index) => models.indexOf(model) === index);
};

export const geminiProvider: AIProvider = {
    generate: async (input, env) => {
        let lastError: unknown;

        for (const model of getGeminiModels(env)) {
            try {
                const response = await geminiClient(getRuntimeEnv(env, 'GEMINI_API_KEY')).models.generateContent({
                    model,
                    contents: input,
                    config: {
                        systemInstruction: FORMAT_CHANGELOG_INSTRUCTIONS,
                        responseMimeType: 'application/json',
                        responseJsonSchema: CHANGELOG_RESPONSE_SCHEMA,
                        temperature: 0,
                        maxOutputTokens: MAX_CHANGELOG_OUTPUT_TOKENS,
                        httpOptions: {
                            timeout: AI_REQUEST_TIMEOUT_MS
                        }
                    }
                });

                return response.text ?? '';
            } catch (error) {
                lastError = error;

                if (!isRetryableGeminiError(error)) throw mapGeminiError(error);
            }
        }

        throw mapGeminiError(lastError);
    }
};
