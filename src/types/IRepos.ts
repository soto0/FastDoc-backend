export interface IRepos {
    id: number;
    name: string;
    owner: { login: string };
}

export interface IReposInfo {
    id: number;
    repo: string;
    owner: string;
}
