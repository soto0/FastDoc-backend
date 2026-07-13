import type { ResponseFormatTextJSONSchemaConfig } from 'openai/resources/responses/responses';

export const DEFAULT_OPENAI_MODEL = 'gpt-5.6-terra';
export const MAX_CHANGELOG_INPUT_CHARS = 30000;
export const MAX_CHANGELOG_OUTPUT_TOKENS = 4096;

export const FORMAT_CHANGELOG_INSTRUCTIONS = `
You are a strict technical changelog formatter.
Return only JSON that matches the provided schema.
Use only facts that are explicitly present in the numbered GitHub release notes.
Every item must include evidenceLines with source line numbers from the input.
Drop any change that cannot be tied to source evidence.
Group only real changes into concise sections such as Breaking Changes, New Features, Bug Fixes, Improvements, Documentation, or Other.
Return at most 20 total items.
Do not add release links, explanations, greetings, or markdown.
`.trim();

export const CHANGELOG_RESPONSE_FORMAT: ResponseFormatTextJSONSchemaConfig = {
    type: 'json_schema',
    name: 'structured_changelog',
    strict: true,
    schema: {
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
    }
};
