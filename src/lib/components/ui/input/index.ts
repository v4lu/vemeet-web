import { type VariantProps, cva } from 'class-variance-authority';

export { default as Input } from './input.svelte';

export const inputVariants = cva('', {
	variants: {
		variant: {
			default:
				'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm',
			empty: 'appearance-none bg-transparent border-none w-full  mr-3 py-1 px-2 focus:outline-none'
		}
	},
	defaultVariants: {
		variant: 'default'
	}
});

export type InputVariants = VariantProps<typeof inputVariants>;
