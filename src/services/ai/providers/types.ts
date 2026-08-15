import type { AppBindings } from '@/types/AppEnv';

export type AIProviderName = 'openai' | 'gemini';

export interface AIProvider {
    generate: (input: string, env?: AppBindings) => Promise<string>;
}
