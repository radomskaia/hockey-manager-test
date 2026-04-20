import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import unicorn from 'eslint-plugin-unicorn';
import vue from 'eslint-plugin-vue';

const sharedTsRules = {
  ...tsPlugin.configs.recommended.rules,
  '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  'unicorn/prefer-export-from': 'off',
  'unicorn/relative-url-style': 'off',
  'unicorn/prefer-module': 'off',
  'unicorn/prevent-abbreviations': 'off',
  'unicorn/filename-case': 'off',
  'unicorn/no-null': 'off',
};

export default [
  {
    ignores: ['node_modules/**', 'dist/**', 'coverage/**', '.husky/_/**', 'src/components/**'],
  },
  js.configs.recommended,
  unicorn.configs['flat/recommended'],
  {
    files: ['**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        module: 'readonly',
        require: 'readonly',
      },
    },
  },
  {
    files: ['**/*.{js,ts,vue}'],
    plugins: {
      import: importPlugin,
    },
    rules: {
      'vue/html-self-closing': [
        'error',
        {
          html: {
            void: 'any',
            normal: 'always',
            component: 'always',
          },
          svg: 'always',
          math: 'always',
        },
      ],
      'curly': ['error', 'all'],
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: 'if' },
        { blankLine: 'always', prev: '*', next: 'for' },
        { blankLine: 'always', prev: '*', next: 'while' },
        { blankLine: 'always', prev: '*', next: 'switch' },
        { blankLine: 'always', prev: '*', next: 'try' },
        { blankLine: 'always', prev: '*', next: 'return' },
        { blankLine: 'always', prev: 'block-like', next: '*' },
      ],
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',
      'import/order': [
        'error',
        {
          'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object'],
          'pathGroups': [
            {
              pattern: '@/**',
              group: 'internal',
              position: 'before',
            },
          ],
          'pathGroupsExcludedImportTypes': ['builtin'],
          'newlines-between': 'always',
          'alphabetize': {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
    },
  },
  ...vue.configs['flat/recommended'],
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...sharedTsRules,
    },
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tsParser,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...sharedTsRules,
      'vue/multi-word-component-names': 'off',
    },
  },
];
