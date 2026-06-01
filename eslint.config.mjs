// @ts-check
import antfu from '@antfu/eslint-config'
import pluginImportX from 'eslint-plugin-import-x'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  antfu({
    vue: true,
    typescript: true,
    stylistic: { indent: 2, quotes: 'single' },
    ignores: [
      '.nuxt',
      '.output',
      'dist',
      'coverage',
      'estimation/**/*.md',
      '.github/copilot-instructions.md',
      '.github/skills/**/*.md',
      '.claude/**',
      '.cursor/**',
      '.agents/**',
    ],
  }),
  {
    name: 'app/module-boundaries',
    plugins: { 'import-x': pluginImportX },
    rules: {
      'import-x/no-cycle': ['error', { maxDepth: 6, ignoreExternal: true }],
      'import-x/no-restricted-paths': ['error', {
        zones: [
          {
            target: './app/shared',
            from: './app/domains',
            message: 'shared/ may not depend on domains/. Promote code only after ≥2 domains need it.',
          },
        ],
      }],
      // Private sub-folders of a domain: services, mapping, stores. Cross-domain
      // access goes through the public surface — auto-imported composables, queries,
      // components, plus explicit imports of types/constants via `#domains/<name>/…`.
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: [
              '~/domains/*/services/**',
              '~/domains/*/mapping/**',
              '~/domains/*/stores/**',
              '#domains/*/services/**',
              '#domains/*/mapping/**',
              '#domains/*/stores/**',
            ],
            message: 'Private domain internals (services, mapping, stores) are off-limits to other domains. Use the auto-imported composable/query/component, or import a type/constant from `#domains/<name>/types|constants`.',
          },
        ],
      }],
    },
  },
  {
    rules: {
      'no-console': 'off',
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
          varsIgnorePattern: '^(_|props)',
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
