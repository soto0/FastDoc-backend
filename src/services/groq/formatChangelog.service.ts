import type { AppBindings } from '@/types/AppEnv';
import { FORMAT_CHANGELOG_PROMPT } from '@/constants/groq';
import { generateAIResponse } from '@/services/groq/generateAIResponse.service';

export const formatChangelog = async ({
    owner,
    repo,
    tag,
    changelog,
    env
}: {
    owner: string;
    repo: string;
    tag: string;
    changelog: string;
    env?: AppBindings;
}): Promise<{ changelog: string } | null> => {
    const response = await generateAIResponse({
        systemPrompt: FORMAT_CHANGELOG_PROMPT(owner, repo, tag),
        prompt: changelog.slice(0, 8000),
        model: 'hard',
        env
    });

    const content = response.choices[0]?.message.content;
    if (content == null) return null;

    return { changelog: content };
};
