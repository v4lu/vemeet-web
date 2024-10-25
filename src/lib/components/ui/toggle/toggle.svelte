<script lang="ts">
	import { cn } from '$lib/cn';
	import { spring } from 'svelte/motion';

	type Props = {
		checked: boolean;
		onchange: () => void;
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
	};

	let { checked, onchange, size = 'md', disabled = false }: Props = $props();

	const toggleSpring = spring(
		{ x: checked ? 1 : 0 },
		{
			stiffness: 0.25,
			damping: 0.7
		}
	);

	$effect(() => {
		toggleSpring.set({ x: checked ? 1 : 0 });
	});

	const sizes = {
		sm: 'h-6 w-11',
		md: 'h-7 w-14',
		lg: 'h-8 w-16'
	};

	const handleSizes = {
		sm: 'size-4',
		md: 'size-5',
		lg: 'size-6'
	};

	const iconSizes = {
		sm: 'size-2.5',
		md: 'size-3',
		lg: 'size-3.5'
	};
</script>

<button
	type="button"
	role="switch"
	aria-checked={checked}
	{disabled}
	class={cn(
		'group relative inline-flex touch-none items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
		sizes[size],
		checked ? 'bg-primary' : 'bg-input'
	)}
	onclick={onchange}
>
	<span
		class={cn(
			'pointer-events-none absolute flex items-center justify-center rounded-full bg-white shadow-lg ring-0 transition-transform',
			handleSizes[size]
		)}
		style="transform: translateX(calc({$toggleSpring.x} * (100% - 100% / 20))); left: 8px;"
	>
		{#if checked}
			<svg
				class={cn('text-primary', iconSizes[size])}
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				stroke-width="3"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
			</svg>
		{/if}
	</span>
</button>
