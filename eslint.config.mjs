import nextPlugin from '@next/eslint-plugin-next';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const nextConfig = nextPlugin.configs['core-web-vitals'];

export default tseslint.config(
  {
    ignores: ['.next/**', 'node_modules/**'],
  },
  ...tseslint.configs.recommended,
  {
    ...nextConfig,
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      ...nextConfig.languageOptions,
      globals: {
        ...globals.browser,
        React: 'readonly',
        JSX: 'readonly',
      },
    },
  },
);
