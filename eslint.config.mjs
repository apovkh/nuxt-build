// @ts-check
// Лінтер-сетап бази: antfu-пресет + Nuxt.
// У nuxt.config обов'язково: modules: ['@nuxt/eslint'] + eslint: { config: { standalone: false } }.
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
      // process/Buffer у server-коді — штатні Node API (env читається у nuxt.config і воркерах).
      'node/prefer-global/process': 'off',
      'node/prefer-global/buffer': 'off',
      // Мікрооптимізація regex не варта шуму.
      'e18e/prefer-static-regex': 'off',
      'no-alert': 'off',
      // Не даємо лінтеру диктувати pnpm-налаштування — це поведінка, а не стиль.
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
