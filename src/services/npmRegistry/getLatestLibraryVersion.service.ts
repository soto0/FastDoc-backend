import type { INpmLibrary } from '@/types/INpmLibrary';
import { AppError } from '@/utils/appError';

interface ILatestLibraryVersion {
    version: string;
}

export const getLatestLibraryVersion = async (library: string): Promise<ILatestLibraryVersion> => {
    const response = await fetch(`https://registry.npmjs.org/${library}`);

    if (response.status === 404) {
        throw new AppError(404, 'Библиотека не найдена', 'NPM_NOT_FOUND');
    }

    if (!response.ok) {
        throw new AppError(500, 'Не удалось получить последнюю версию библиотеки', 'NPM_REGISTRY_ERROR');
    }

    const data = (await response.json()) as INpmLibrary;
    return { version: data['dist-tags'].latest };
};
