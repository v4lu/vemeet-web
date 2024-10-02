<script lang="ts">
	import { cn } from '$lib/cn';
	import type { VariantProps } from 'class-variance-authority';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { inputVariants } from '.';

	type Variant = VariantProps<typeof inputVariants>['variant'];

	type InputProps = Omit<HTMLInputAttributes, 'value'> & {
		class?: string;
		value?: string | number;
		variant?: Variant;
	};

	let { variant, class: className, value = $bindable(), ...rest }: InputProps = $props();

	$effect(() => {
		if (typeof value === 'number') {
			value = value.toString();
		}
	});
</script>

<input bind:value class={cn(inputVariants({ variant, className }))} {...rest} />
