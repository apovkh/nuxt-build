module.exports = {
	env: {
		browser: true,
		es2021: true,
		node: true
	},
	extends: [
		'standard',
		'eslint:recommended',
		'plugin:vue/vue3-essential',
		'plugin:@typescript-eslint/recommended',
		'plugin:jsonc/recommended-with-jsonc',
		'plugin:yml/standard'
	],
	overrides: [
		{
			files: ['**/*.js', '**/*.vue', '**/*.ts', '**/*.tsx'],
			rules: {
				'simple-import-sort/imports': [
					'error',
					{
						groups: [
							['^vue$', '^next', '^[a-z]'],
							['^@'],
							['^~'],
							['^\\.\\.(?!/?$)', '^\\.\\./?$'],
							['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
							['^.+\\.s?css$'],
							// Side effect imports
							['^\\u0000']
						]
					}
				]
			}
		},
		{
			files: ['*.vue'],
			parser: 'vue-eslint-parser',
			parserOptions: {
				parser: '@typescript-eslint/parser'
			},
			rules: {
				'@typescript-eslint/no-unused-vars': 'off'
			}
		},
		{
			files: ['./src/**/*ts'],
			parser: '@typescript-eslint/parser'
		},
		{
			files: ['*.json', '*.json5'],
			parser: 'jsonc-eslint-parser',
			rules: {
				quotes: ['error', 'double'],
				'quote-props': ['error', 'always'],
				'comma-dangle': ['error', 'never']
			}
		},
		{
			files: ['scripts/**/*.*'],
			rules: {
				'no-console': 'off'
			}
		},
		{
			files: ['*.test.ts', '*.test.js', '*.spec.ts', '*.spec.js'],
			rules: {
				'no-unused-expressions': 'off'
			}
		}
	],
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module'
	},
	plugins: [
		'simple-import-sort',
		'vue',
		'@typescript-eslint'
	],
	rules: {
		indent: ['error', 'tab'],
		quotes: ['error', 'single'],
		semi: ['error', 'never'],
		'array-bracket-spacing': ['error', 'never'],
		'no-tabs': 'off',
		'no-debugger': 'error',
		'no-console': 'error',
		'no-unused-vars': 'off',
		'max-len': ['warn', { code: 80 }],
		'linebreak-style': ['error', 'unix'],
		'simple-import-sort/imports': 'error',
		'simple-import-sort/exports': 'error',
		'sort-imports': [
			'error',
			{
				ignoreCase: false,
				ignoreDeclarationSort: true,
				ignoreMemberSort: false,
				memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
				allowSeparatedGroups: false
			}
		],

		'vue/multi-word-component-names': 'off',
		'vue/no-v-html': 'off',
		'vue/require-prop-types': 'off',
		'vue/require-default-prop': 'off',
		'vue/multi-word-component-names': 'off',
		'vue/max-attributes-per-line': ['warn', {
			singleline: 2,
			multiline: 1
		}],
		'vue/component-name-in-template-casing': [
			'warn',
			'PascalCase',
			{
				registeredComponentsOnly: false
			}
		],
		'vue/component-tags-order': ['error', {
			order: ['script', 'template', 'style']
		}],

		'@typescript-eslint/semi': ['error', 'never'],
		'@typescript-eslint/member-delimiter-style': ['error', {
			multiline: { delimiter: 'none' }
		}],
		'@typescript-eslint/adjacent-overload-signatures': 'warn',
		'@typescript-eslint/no-inferrable-types': 'off',
		'@typescript-eslint/array-type': 'error',
		'@typescript-eslint/ban-types': 'error',
		'@typescript-eslint/class-literal-property-style': 'error',
		'@typescript-eslint/consistent-generic-constructors': 'error',
		'@typescript-eslint/consistent-indexed-object-style': 'error',
		'@typescript-eslint/consistent-type-imports': ['error',
			{
				prefer: 'type-imports',
				disallowTypeAnnotations: false,
				fixStyle: 'separate-type-imports'
			}
		],
		'@typescript-eslint/explicit-function-return-type': 'error',
		'@typescript-eslint/no-confusing-non-null-assertion': 'error',
		'@typescript-eslint/no-duplicate-enum-values': 'error',
		'@typescript-eslint/no-empty-interface': 'error',
		'@typescript-eslint/no-explicit-any': ['warn',
			{ ignoreRestArgs: true }
		],
		'@typescript-eslint/no-non-null-assertion': 'off',
		'@typescript-eslint/no-require-imports': 'warn',
		'@typescript-eslint/typedef': ['warn', {
			arrayDestructuring: true,
			arrowParameter: true,
			memberVariableDeclaration: true,
			objectDestructuring: true,
			parameter: true,
			propertyDeclaration: true
		}],
		'@typescript-eslint/no-unused-vars': 'error'
	}
}
