// @ts-check
// Base linter setup: antfu preset + Nuxt.
// Required in nuxt.config: modules: ['@nuxt/eslint'] + eslint: { config: { standalone: false } }.
import antfu from '@antfu/eslint-config'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  antfu({
    ignores: [
      '**/*.md',
      '.claude/**',
    ],
  }),
  {
    rules: {
      'no-console': 'off',
      // process/Buffer in server code are standard Node APIs (env is read in nuxt.config and workers).
      'node/prefer-global/process': 'off',
      'node/prefer-global/buffer': 'off',
      // Regex micro-optimization is not worth the noise.
      'e18e/prefer-static-regex': 'off',
      'no-alert': 'off',
      // Don't let the linter dictate pnpm settings — that's behavior, not style.
      'pnpm/yaml-enforce-settings': 'off',
      'vue/component-name-in-template-casing': [
        'error',
        'PascalCase',
        {
          registeredComponentsOnly: false,
          ignores: [],
        },
      ],
      'antfu/top-level-function': 'off',
      'vue/valid-v-slot': [
        'error',
        {
          allowModifiers: true,
        },
      ],
      'unused-imports/no-unused-vars': [
        'error',
        {
          varsIgnorePattern: 'props',
          argsIgnorePattern: '^_',
        },
      ],
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: 'return' },
        { blankLine: 'always', prev: '*', next: 'if' },
        { blankLine: 'always', prev: 'if', next: '*' },
      ],
      'test/prefer-lowercase-title': 'off',
    },
  },
)
