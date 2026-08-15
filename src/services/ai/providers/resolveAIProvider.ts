import type { AIProvider, AIProviderName } from '@/services/ai/providers/types';
import type { AppBindings } from '@/types/AppEnv';
import { getRuntimeEnv } from '@/config/runtimeEnv';
import { DEFAULT_AI_PROVIDER } from '@/constants/ai';
import { geminiProvider } from '@/services/ai/providers/gemini.provider';
import { openaiProvider } from '@/services/ai/providers/openai.provider';
import { AppError } from '@/utils/appError';

const providers: Record<AIProviderName, AIProvider> = {
    openai: openaiProvider,
    gemini: geminiProvider
};

const normalizeProviderName = (providerName: string | undefined): AIProviderName => {
    const normalizedProviderName = providerName?.trim().toLowerCase() ?? DEFAULT_AI_PROVIDER;

    if (normalizedProviderName === 'openai' || normalizedProviderName === 'gemini') return normalizedProviderName;

    throw new AppError(400, 'Неверный AI provider', 'AI_INVALID_PROVIDER');
};

export const resolveAIProvider = (env: AppBindings | undefined): AIProvider => providers[normalizeProviderName(getRuntimeEnv(env, 'AI_PROVIDER'))];
