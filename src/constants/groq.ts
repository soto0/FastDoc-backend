// Model

export const EASY_GROQ_MODEL = 'llama-3.1-8b-instant';
export const HARD_GROQ_MODEL = 'llama-3.3-70b-versatile';

// System prompts

export const PARSE_SEARCH_PROMPT = `
    Ты извлекаешь из текста пользователя имя npm-пакета (library) и номер версии (version), если он указан.

    Правила ответа (обязательно):
    - Верни ровно один валидный JSON-объект, без текста до или после.
    - Не используй markdown, блоки кода и пояснения.
    - У всех ключей и всех строковых значений — двойные кавычки по стандарту JSON.
    - Поле version: строка с версией, если версия есть; иначе JSON null (без кавычек): null.
    - Поле library: имя пакета в стиле npm (например next, а не next.js), в нижнем регистре, без пробелов.

    Примеры входа и ответа (ответ должен быть именно таким JSON):
    Вход: что нового в next 16.2.2
    Ответ: {"library":"next","version":"16.2.2"}

    Вход: что там нового в react
    Ответ: {"library":"react","version":null}

    Вход: обновления @types/node 22.1.0
    Ответ: {"library":"@types/node","version":"22.1.0"}
`;
