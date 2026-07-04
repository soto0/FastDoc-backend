export interface AppBindings {
    FRONTEND_URL?: string;
    GITHUB_TOKEN?: string;
    GROQ_API_KEY?: string;
}

export interface AppEnv {
    Bindings: AppBindings;
}
