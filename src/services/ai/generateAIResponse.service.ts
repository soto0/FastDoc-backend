import type { AppBindings } from '@/types/AppEnv';
import { resolveAIProvider } from '@/services/ai/providers/resolveAIProvider';

interface GenerateAIResponseParams {
    input: string;
    env?: AppBindings;
}

export const generateAIResponse = async ({ input, env }: GenerateAIResponseParams): Promise<string> => {
    const provider = resolveAIProvider(env);

    return provider.generate(input, env);
};
