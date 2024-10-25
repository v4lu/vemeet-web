import { cva } from 'class-variance-authority';

export { default as Button } from './button.svelte';
export type AccordionContent = {
	title: string;
	content: string;
};

export const buttonVariants = cva(
	'inline-flex select-none items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
	{
		variants: {
			variant: {
				default:
					'bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg active:shadow-sm',
				destructive:
					'bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground',
				outline: 'border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground',
				'outline-file':
					'border-2 border-input bg-background transition-all duration-300 ease-in-out hover:border-primary hover:bg-primary hover:text-primary-foreground',
				secondary:
					'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:shadow-md active:shadow-sm',
				ghost: 'hover:bg-accent hover:text-accent-foreground',
				link: 'text-primary underline-offset-4 hover:underline',

				gradient:
					'bg-gradient-to-r from-primary to-secondary text-white shadow-md hover:from-primary/90 hover:to-secondary/90 hover:shadow-lg active:shadow-sm'
			},
			size: {
				default: 'h-10 px-4 py-2',
				xs: 'h-7 rounded-md px-2 text-xs',
				sm: 'h-9 rounded-md px-3',
				lg: 'h-12 rounded-md px-8 text-base',
				icon: 'h-10 w-10',
				'icon-sm': 'h-8 w-8',
				'icon-xs': 'h-7 w-7 p-0'
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'default'
		}
	}
);
