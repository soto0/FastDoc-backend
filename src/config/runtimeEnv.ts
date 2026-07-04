import type { AppBindings } from '@/types/AppEnv';
import process from 'node:process';

export const getRuntimeEnv = (env: AppBindings | undefined, key: keyof AppBindings): string | undefined => env?.[key] ?? process.env[key];
