<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/cn';

	type Props = {
		children: Snippet;
		class?: string;
	};

	let { children, class: className }: Props = $props();
</script>

<div
	class={cn(
		'container min-h-full bg-background px-4 py-4 sm:px-6 md:border-x md:border-border md:bg-card md:px-8',
		className
	)}
>
	{@render children()}
</div>
