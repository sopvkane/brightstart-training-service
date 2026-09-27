import { defineConfig } from 'eslint/config';
import typescriptEslint from 'typescript-eslint';

export default defineConfig([
  {
    ignores: ['dist/', 'public/application.css'],
  },
  {
    files: ['src/**/*.ts', 'test/**/*.ts'],
    extends: [typescriptEslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
]);
