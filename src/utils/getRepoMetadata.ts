import type { IRepos, IReposInfo } from '@/types/IRepos';

export const getRepoMetadata = (repos: IRepos[]): IReposInfo[] => {
    const reposInfo = repos.map((item) => ({
        id: item.id,
        repo: item.name,
        owner: item.owner.login
    }));

    return reposInfo;
};
