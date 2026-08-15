export const DEFAULT_AI_PROVIDER = 'openai';
export const DEFAULT_OPENAI_MODEL = 'gpt-5.6-terra';
export const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash';
export const GEMINI_FALLBACK_MODELS = ['gemini-flash-lite-latest', 'gemini-flash-latest'];
export const AI_REQUEST_TIMEOUT_MS = 30000;
export const MAX_CHANGELOG_INPUT_CHARS = 30000;
export const MAX_CHANGELOG_OUTPUT_TOKENS = 4096;

export const FORMAT_CHANGELOG_INSTRUCTIONS = `
You are a strict technical changelog formatter.
Return only JSON that matches the provided schema.
Use only facts that are explicitly present in the numbered GitHub release notes.
Write every section title and every item text in Russian, even when the source release notes are written in English.
Translate technical wording carefully and keep product names, API names, package names, versions, file names, commands, and issue or PR numbers unchanged.
Every item must include evidenceLines with source line numbers from the input.
Drop any change that cannot be tied to source evidence.
Group only real changes into concise Russian sections such as Критические изменения, Новые возможности, Исправления, Улучшения, Документация, or Прочее.
Return at most 20 total items.
Do not add release links, explanations, greetings, or markdown.
`.trim();

export const CHANGELOG_RESPONSE_SCHEMA_NAME = 'structured_changelog';

export const CHANGELOG_RESPONSE_SCHEMA: { [key: string]: unknown } = {
    type: 'object',
    additionalProperties: false,
    properties: {
        sections: {
            type: 'array',
            items: {
                type: 'object',
                additionalProperties: false,
                properties: {
                    title: { type: 'string' },
                    items: {
                        type: 'array',
                        items: {
                            type: 'object',
                            additionalProperties: false,
                            properties: {
                                text: { type: 'string' },
                                evidenceLines: {
                                    type: 'array',
                                    items: { type: 'integer' }
                                }
                            },
                            required: ['text', 'evidenceLines']
                        }
                    }
                },
                required: ['title', 'items']
            }
        }
    },
    required: ['sections']
};
