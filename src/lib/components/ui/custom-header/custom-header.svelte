<script lang="ts">
	import Icon from '@iconify/svelte';
	import type { Snippet } from 'svelte';
	import { goto } from '$app/navigation';
	import { cn } from '$lib/cn';

	type Props = {
		children: Snippet;
		class?: string;
	};

	let { children, class: className }: Props = $props();

	function handleBack() {
		if (window.history.length > 2) {
			history.back();
		} else {
			goto('/');
		}
	}
</script>

<div
	class="fixed inset-x-0 top-0 z-[90] mx-auto h-16 w-full max-w-[60rem] bg-card md:border-x lg:border-x lg:border-border"
>
	<header
		class={cn(
			'container relative flex h-full items-center justify-between border-b border-border py-3 pl-16',
			className
		)}
	>
		<button
			class="absolute left-2 top-1/2 flex -translate-y-1/2 items-center text-sm font-bold text-muted-foreground transition-colors hover:text-primary"
			onclick={handleBack}
		>
			<Icon icon="lucide:chevron-left" class="mr-2 size-6 font-bold" />
		</button>
		{@render children()}
	</header>
</div>
