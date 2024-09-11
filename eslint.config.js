import config from '@huntabyte/eslint-config';

export default config({
	svelte: true,
	rules: {
		'import/order': 'off',
		'@typescript-eslint/explicit-function-return-type': 'error'
	}
});
