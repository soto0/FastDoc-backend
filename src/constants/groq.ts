// Model

export const EASY_GROQ_MODEL = 'llama-3.1-8b-instant';
export const HARD_GROQ_MODEL = 'llama-3.3-70b-versatile';

// System prompts

export const FORMAT_CHANGELOG_PROMPT = (owner: string, repo: string, version: string) => `
Ты помощник по технической документации.
Тебе дан changelog библиотеки с GitHub.
Отформатируй его красиво в markdown:
- ## для основных секций (Breaking Changes, New Features, Bug Fixes)
- ### для подсекций
- bullet points для отдельных изменений
- 'код' для названий методов, компонентов, переменных
- Если changelog слишком длинный — бери только самые важные изменения, максимум 20 пунктов.
- В конце всегда добавляй: Подробнее обо всех изменениях: [Release Notes](https://github.com/${owner}/${repo}/releases/tag/${version})
Отвечай только markdown, без вступлений и объяснений.
`;
