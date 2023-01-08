module.exports = {
	env: {
		browser: true,
		es2021: true,
		node: true	
	},
	extends: [
		'eslint:recommended',
		'plugin:vue/vue3-essential',
		'plugin:@typescript-eslint/recommended'
	],
	overrides: [
		{
			files: ['*.vue'],
			parser: 'vue-eslint-parser',
			parserOptions: {
				parser: '@typescript-eslint/parser',
			},
		},
		{
			files: ['./src/**/*ts'],
			parser: '@typescript-eslint/parser',
		}
	],
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module'
	},
	plugins: [
		'vue',
		'@typescript-eslint'
	],
	rules: {
		indent: ['error','tab'],
		quotes: ['error', 'single'],
		semi: ['error', 'never'],
		'linebreak-style': ['error', 'unix'],

		'vue/multi-word-component-names': 'off',

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
		'@typescript-eslint/no-explicit-any': ['error',
			{ ignoreRestArgs: true }
		],
		'@typescript-eslint/no-non-null-assertion': 'off',
		'@typescript-eslint/no-require-imports': 'warn',
		'@typescript-eslint/typedef': ['warn', {
			'arrayDestructuring': true,
			'arrowParameter': true,
			'memberVariableDeclaration': true,
			'objectDestructuring': true,
			'parameter': true,
			'propertyDeclaration': true,
		}],
		'no-unused-vars': 'off',
		'@typescript-eslint/no-unused-vars': 'error'
	}
}
