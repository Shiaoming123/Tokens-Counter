import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import prettier from 'eslint-config-prettier'

const runtimeGlobals = {
  Blob: 'readonly',
  DragEvent: 'readonly',
  Event: 'readonly',
  FileReader: 'readonly',
  HTMLInputElement: 'readonly',
  Image: 'readonly',
  MessageEvent: 'readonly',
  MutationObserver: 'readonly',
  PointerEvent: 'readonly',
  Request: 'readonly',
  Response: 'readonly',
  Storage: 'readonly',
  TextDecoder: 'readonly',
  TextEncoder: 'readonly',
  URL: 'readonly',
  Worker: 'readonly',
  clearTimeout: 'readonly',
  console: 'readonly',
  crypto: 'readonly',
  document: 'readonly',
  fetch: 'readonly',
  globalThis: 'readonly',
  localStorage: 'readonly',
  navigator: 'readonly',
  process: 'readonly',
  self: 'readonly',
  setTimeout: 'readonly',
  window: 'readonly',
}

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/*.d.ts',
      '.agents/**',
      '.claude/**',
      '.playwright-mcp/**',
      '.vercel/**',
      'tmp/**',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  prettier,
  {
    files: ['**/*.{ts,tsx,vue}'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
      globals: runtimeGlobals,
    },
    rules: {
      'no-console': 'warn',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'prefer-const': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
    },
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: runtimeGlobals,
    },
  },
  {
    files: ['server/**/*.{ts,tsx}', 'scripts/**/*.{js,mjs,cjs}'],
    rules: {
      'no-console': 'off',
    },
  },
)
