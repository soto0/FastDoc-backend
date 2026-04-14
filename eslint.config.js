import antfu from '@antfu/eslint-config';
import prettier from 'eslint-config-prettier';

export default antfu(
    {
        typescript: {
            tsconfigPath: './tsconfig.json'
        },
        overrides: [
            {
                files: ['**/*.test.ts'],
                rules: {
                    '@typescript-eslint/no-unused-vars': 'off',
                    '@typescript-eslint/no-unsafe-assignment': 'off',
                    '@typescript-eslint/no-unsafe-call': 'off',
                    '@typescript-eslint/no-unsafe-member-access': 'off'
                }
            }
        ],
        stylistic: false
    },
    { ignores: ['**/*.md'] }
).append(prettier);
