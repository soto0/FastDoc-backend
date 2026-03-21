import antfu from '@antfu/eslint-config';
import prettier from 'eslint-config-prettier';

export default antfu({ typescript: { tsconfigPath: './tsconfig.json' }, stylistic: false }, { ignores: ['**/*.md'] }).append(prettier);
