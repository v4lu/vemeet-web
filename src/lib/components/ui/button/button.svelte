<script lang="ts">
	import { cn } from '$lib/cn';
	import Icon from '@iconify/svelte';
	import type { VariantProps } from 'class-variance-authority';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { buttonVariants } from '.';

	type Variant = VariantProps<typeof buttonVariants>['variant'];
	type Size = VariantProps<typeof buttonVariants>['size'];

	type ButtonPropsType = HTMLButtonAttributes & {
		isLoading?: boolean;
		class?: string;
		variant?: Variant;
		size?: Size;
	};

	let {
		isLoading,
		class: className,
		variant = 'default',
		size = 'default',
		children,
		...rest
	}: ButtonPropsType = $props();
</script>

<button {...rest} class={cn(buttonVariants({ variant, size, className }))}>
	{#if isLoading}
		<Icon icon="svg-spinners:blocks-shuffle-2" class="mr-2 h-3.5 w-3.5" />
	{/if}
	{#if children}
		{@render children()}
	{/if}
</button>
