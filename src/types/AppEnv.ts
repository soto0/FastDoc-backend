export interface AppBindings {
    FRONTEND_URL?: string;
    GITHUB_TOKEN?: string;
    OPENAI_API_KEY?: string;
    OPENAI_MODEL?: string;
}

export interface AppEnv {
    Bindings: AppBindings;
}
