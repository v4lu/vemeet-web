<script lang="ts">
	import { cn } from '$lib/cn';
	import Icon from '@iconify/svelte';
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
		class?: string;
	};

	let { children, class: className }: Props = $props();
</script>

<div class="fixed inset-x-0 top-0 z-[90] h-16 w-full bg-background">
	<header
		class={cn(
			'container relative flex h-full items-center justify-between border-b border-border py-3 pl-16',
			className
		)}
	>
		<button
			class="absolute left-2 top-1/2 flex -translate-y-1/2 items-center text-sm font-bold text-muted-foreground transition-colors hover:text-primary"
			onclick={() => history.back()}
		>
			<Icon icon="lucide:chevron-left" class="mr-2 size-6 font-bold" />
		</button>
		{@render children()}
	</header>
</div>
