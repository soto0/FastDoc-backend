import type { INpmLibrary } from '@/types/INpmLibrary';
import { AppError } from '@/utils/appError';
import { resolveRepositoryURL } from '@/utils/resolveRepository';

interface INpmLibraryMetadataParams {
    library: string;
    version: string;
}

interface INpmLibraryMetadata {
    version: string;
    repository: string;
}

export const getNpmLibraryMetadata = async ({ library, version }: INpmLibraryMetadataParams): Promise<INpmLibraryMetadata> => {
    const response = await fetch(`https://registry.npmjs.org/${library}/${version || 'latest'}`);

    if (response.status === 404) {
        throw new AppError(404, 'Пакет не найден', 'NPM_NOT_FOUND');
    }

    if (!response.ok) {
        throw new AppError(500, 'Не удалось получить метаданные пакета', 'NPM_REGISTRY_ERROR');
    }

    const data = (await response.json()) as INpmLibrary;

    return { version: data.version, repository: resolveRepositoryURL(data.repository) };
};
