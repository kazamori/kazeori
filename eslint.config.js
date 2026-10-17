import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';

export default ts.config(
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	{
		languageOptions: { globals: { ...globals.browser, ...globals.node, Bun: 'readonly' } }
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts'],
		languageOptions: { parserOptions: { parser: ts.parser } }
	},
	{
		rules: { 'svelte/no-at-html-tags': 'off' }
	},
	{
		ignores: [
			'node_modules/',
			'**/.svelte-kit/',
			'**/.kazeori/',
			'**/dist/',
			'build/',
			'test/fixtures/',
			'.claude/'
		]
	}
);
