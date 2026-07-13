import type { AppBindings } from '@/types/AppEnv';
import { z } from 'zod';
import { MAX_CHANGELOG_INPUT_CHARS } from '@/constants/ai';
import { generateAIResponse } from '@/services/ai/generateAIResponse.service';

const changelogItemSchema = z
    .object({
        text: z.string().trim().min(1),
        evidenceLines: z.array(z.number().int().positive()).min(1)
    })
    .strict();

const changelogSectionSchema = z
    .object({
        title: z.string().trim().min(1),
        items: z.array(changelogItemSchema).min(1)
    })
    .strict();

const structuredChangelogSchema = z
    .object({
        sections: z.array(changelogSectionSchema).min(1)
    })
    .strict();

type StructuredChangelog = z.infer<typeof structuredChangelogSchema>;

const newLineRegex = /\r?\n/;

interface FormatChangelogParams {
    owner: string;
    repo: string;
    tag: string;
    changelog: string;
    env?: AppBindings;
}

interface NumberedChangelog {
    lineCount: number;
    text: string;
}

const buildNumberedChangelog = (changelog: string): NumberedChangelog => {
    const limitedChangelog = changelog.slice(0, MAX_CHANGELOG_INPUT_CHARS);
    const lines = limitedChangelog.split(newLineRegex);

    return {
        lineCount: lines.length,
        text: lines.map((line, index) => `${index + 1}: ${line}`).join('\n')
    };
};

const buildChangelogInput = ({ owner, repo, tag, changelog }: FormatChangelogParams): NumberedChangelog => {
    const numberedChangelog = buildNumberedChangelog(changelog);

    return {
        lineCount: numberedChangelog.lineCount,
        text: [
            `Repository: ${owner}/${repo}`,
            `Release tag: ${tag}`,
            'Raw GitHub release notes with stable line numbers:',
            numberedChangelog.text
        ].join('\n\n')
    };
};

const hasOnlyExistingEvidenceLines = (evidenceLines: number[], lineCount: number): boolean =>
    evidenceLines.length > 0 && evidenceLines.every((line) => line >= 1 && line <= lineCount);

const filterVerifiedChangelog = (structuredChangelog: StructuredChangelog, lineCount: number): StructuredChangelog | null => {
    const sections = structuredChangelog.sections
        .map((section) => ({
            title: section.title,
            items: section.items.filter((item) => hasOnlyExistingEvidenceLines(item.evidenceLines, lineCount))
        }))
        .filter((section) => section.items.length > 0);

    if (sections.length === 0) return null;

    return { sections };
};

const parseStructuredChangelog = (outputText: string, lineCount: number): StructuredChangelog | null => {
    const trimmedOutput = outputText.trim();
    if (trimmedOutput.length === 0) return null;

    let parsedOutput: unknown;

    try {
        parsedOutput = JSON.parse(trimmedOutput);
    } catch {
        return null;
    }

    const validationResult = structuredChangelogSchema.safeParse(parsedOutput);
    if (!validationResult.success) return null;

    return filterVerifiedChangelog(validationResult.data, lineCount);
};

const renderMarkdown = ({
    structuredChangelog,
    owner,
    repo,
    tag
}: Omit<FormatChangelogParams, 'changelog' | 'env'> & { structuredChangelog: StructuredChangelog }): string => {
    const lines = structuredChangelog.sections.flatMap((section) => [`## ${section.title}`, ...section.items.map((item) => `- ${item.text}`), '']);

    lines.push(`Подробнее обо всех изменениях: [Release Notes](https://github.com/${owner}/${repo}/releases/tag/${encodeURIComponent(tag)})`);

    return lines.join('\n').trim();
};

export const formatChangelog = async ({ owner, repo, tag, changelog, env }: FormatChangelogParams): Promise<{ changelog: string } | null> => {
    const changelogInput = buildChangelogInput({ owner, repo, tag, changelog, env });
    const response = await generateAIResponse({ input: changelogInput.text, env });
    const structuredChangelog = parseStructuredChangelog(response, changelogInput.lineCount);

    if (structuredChangelog == null) return null;

    return { changelog: renderMarkdown({ structuredChangelog, owner, repo, tag }) };
};
