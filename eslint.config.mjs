import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';
import playwright from 'eslint-plugin-playwright';

export default defineConfig(
    {
        ignores: [
            'node_modules/',
            '**/dist/',
            'public/js/',
            'data/',
            'test-results/',
            'playwright-report/',
            'blob-report/',
            'playwright/.cache/',
            'playwright/.auth/',
            '.features-gen/'
        ],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        rules: {
            '@typescript-eslint/no-unused-vars': ['error', {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
            }],
            '@typescript-eslint/no-namespace': ['error', { 
                allowDeclarations: true 
            }]
        },
    },
    {
        ...playwright.configs['flat/recommended'],
        files: ['tests/**/*.ts', 'tests/**/*.js', 'fixtures/**/*.ts', 'factories/**/*.ts', 'pages/**/*.ts'],
    },
);