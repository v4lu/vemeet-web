<script lang="ts">
	import { useSwiperMode } from '$lib/api/use-swipper-mode.svelte';
	import Icon from '@iconify/svelte';
	import { flip } from 'svelte/animate';
	import { fade, fly } from 'svelte/transition';
	import { SwipeCard } from '../cards';
	import SwipeCardSkeleton from '../skeleton/swipe-card-skeleton.svelte';
	import { Button } from '../ui/button';

	type Props = {
		authToken: string;
	};

	let { authToken }: Props = $props();
	const { resp, swipe } = useSwiperMode(authToken);
	let currentIndex = $state(0);
	let hasMatches = $derived(resp.potentialMatches && resp.potentialMatches.length > 0);
	let showNoMoreMatches = $derived(!resp.isLoading && !hasMatches && !resp.hasMore);
	let lastSwipeDirection = $state<'left' | 'right' | null>(null);

	async function handleSwipe(direction: 'left' | 'right') {
		if (!resp.potentialMatches[currentIndex]) return;
		lastSwipeDirection = direction;
		const success = await swipe(direction, resp.potentialMatches[currentIndex].userId);
		if (success) {
			currentIndex = 0;
		}
	}

	function cardTransition(
		node: HTMLElement,
		{ direction }: { direction: 'left' | 'right' | null }
	) {
		const dx = direction === 'left' ? -1000 : 1000;
		return {
			duration: 300,
			css: (t: number, u: number) => `
		  transform: translate(${u * dx}px, 0) rotate(${u * (direction === 'left' ? -10 : 10)}deg);
		  opacity: ${t}
		`
		};
	}
</script>

<div class="no-scrollbar relative mt-12 h-[650px] overflow-hidden px-4">
	{#if resp.isLoading}
		<SwipeCardSkeleton />
	{:else if hasMatches}
		{#each resp.potentialMatches as match, index (match.id)}
			<div
				animate:flip={{ duration: 300 }}
				in:fly={{ y: 50, duration: 300, delay: index * 100 }}
				out:cardTransition={{ direction: lastSwipeDirection }}
				class="no-scrollbar absolute left-0 top-0 h-full w-full"
				style="z-index: {resp.potentialMatches.length - index};"
			>
				<SwipeCard {index} {match} onSwipe={handleSwipe} />
				<div class="mt-4 flex justify-center space-x-4">
					<Button
						size="icon"
						variant="outline"
						onclick={() => handleSwipe('left')}
						class="size-12 rounded-full p-0 transition-colors hover:bg-red-100 dark:hover:bg-red-900"
					>
						<Icon icon="mdi:close" class="size-8 text-red-500" />
					</Button>
					<Button
						variant="outline"
						size="icon"
						onclick={() => handleSwipe('right')}
						class="size-12 rounded-full p-0 transition-colors hover:bg-green-100 dark:hover:bg-green-900"
					>
						<Icon icon="mdi:heart" class="size-8 text-green-500" />
					</Button>
				</div>
			</div>
		{/each}
	{:else if showNoMoreMatches}
		<div class="mt-4 flex min-h-[600px] items-center justify-center text-center" in:fade>
			<p class="text-muted-foreground">No more matches available at the moment.</p>
		</div>
	{/if}
</div>

<style>
	.no-scrollbar {
		-ms-overflow-style: none; /* IE and Edge */
		scrollbar-width: none; /* Firefox */
	}
	.no-scrollbar::-webkit-scrollbar {
		display: none; /* Chrome, Safari and Opera */
	}
</style>
