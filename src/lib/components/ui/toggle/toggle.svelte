<script lang="ts">
	import { cn } from '$lib/cn';
	import { cubicOut } from 'svelte/easing';
	import { spring, tweened } from 'svelte/motion';

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
			stiffness: 0.2,
			damping: 0.4
		}
	);

	$effect(() => {
		toggleSpring.set({ x: checked ? 1 : 0 });
	});

	const backgroundTween = tweened(checked ? 100 : 0, {
		duration: 150,
		easing: cubicOut
	});

	$effect(() => {
		backgroundTween.set(checked ? 100 : 0);
	});

	const sizes = {
		sm: 'h-5 w-9',
		md: 'h-6 w-11',
		lg: 'h-7 w-14'
	};

	const handleSizes = {
		sm: 'h-4 w-4',
		md: 'h-5 w-5',
		lg: 'h-6 w-6'
	};
</script>

<button
	type="button"
	role="switch"
	aria-checked={checked}
	{disabled}
	class={cn(
		'relative inline-flex items-center rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
		sizes[size],
		checked ? 'bg-primary' : 'bg-input'
	)}
	onclick={onchange}
>
	<span
		class={cn(
			'absolute left-[2px] flex items-center justify-center rounded-full bg-background shadow-lg ring-0 transition-all',
			handleSizes[size]
		)}
		style="transform: translateX(calc({$toggleSpring.x} * (100%)))"
	>
		{#if checked}
			<svg class="h-3 w-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
			</svg>
		{/if}
	</span>
</button>
