import js from '@eslint/js'

const nodeGlobals = {
  console: 'readonly',
  process: 'readonly',
}

export default [
  {
    ignores: ['node_modules/**', '.vitepress/cache/**', '.vitepress/dist/**'],
  },
  {
    files: ['eslint.config.mjs', 'scripts/**/*.{js,mjs,cjs}'],
    ...js.configs.recommended,
    languageOptions: {
      ...js.configs.recommended.languageOptions,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: nodeGlobals,
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
]
