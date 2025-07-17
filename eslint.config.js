// eslint.config.js
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  // Base configuration from ESLint
  eslint.configs.recommended,

  // TypeScript specific configurations
  ...tseslint.configs.recommended,

  // Prettier configuration to disable conflicting rules
  prettierConfig,

  // Custom rules can be added in their own object
  {
    rules: {
      // You can override or add rules here
      // For example, to warn about console.log usage:
      // 'no-console': 'warn',

      // We don't need this, as Prettier handles it, but as an example:
      '@typescript-eslint/no-explicit-any': 'warn',
      'prefer-const': 'off',
    },
  }
);
