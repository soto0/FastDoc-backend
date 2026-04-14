import { FORMAT_CHANGELOG_PROMPT } from '@/constants/groq';
import { generateAIResponse } from '@/services/groq/generateAIResponse.service';

export const formatChangelog = async ({
    owner,
    repo,
    version,
    changelog
}: {
    owner: string;
    repo: string;
    version: string;
    changelog: string;
}): Promise<string | null> => {
    const response = await generateAIResponse({
        systemPrompt: FORMAT_CHANGELOG_PROMPT(owner, repo, version),
        prompt: changelog.slice(0, 8000),
        model: 'hard'
    });

    const content = response.choices[0]?.message.content;
    if (content == null) return null;

    return content;
};
