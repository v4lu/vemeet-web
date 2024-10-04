<script lang="ts">
	import { useSwiperMode } from '$lib/api/use-swipper-mode.svelte';
	import { cn } from '$lib/cn';
	import { Button } from '$lib/components/ui/button';
	import { calculateAge } from '$lib/date';
	import Icon from '@iconify/svelte';
	import { flip } from 'svelte/animate';
	import { spring } from 'svelte/motion';
	import { fade, fly } from 'svelte/transition';

	type Props = {
		authToken: string;
	};

	let { authToken }: Props = $props();
	const { resp, swipe } = useSwiperMode(authToken);

	let currentIndex = $state(0);
	let currentImageIndex = $state(0);
	let draggedCard = $state<HTMLElement | null>(null);
	let dragStartX = $state(0);
	let dragStartY = $state(0);
	let draggedDistance = spring({ x: 0, y: 0 }, { stiffness: 0.2, damping: 0.4 });
	let swipeDirection = $state<'left' | 'right' | null>(null);

	let currentMatch = $derived(resp.potentialMatches[currentIndex]);

	function handleDragStart(event: MouseEvent | TouchEvent) {
		draggedCard = event.target as HTMLElement;
		const { clientX, clientY } = 'touches' in event ? event.touches[0] : event;
		dragStartX = clientX;
		dragStartY = clientY;
		window.addEventListener('mousemove', handleDrag);
		window.addEventListener('touchmove', handleDrag);
		window.addEventListener('mouseup', handleDragEnd);
		window.addEventListener('touchend', handleDragEnd);
	}

	function handleDrag(event: MouseEvent | TouchEvent) {
		if (!draggedCard) return;
		const { clientX, clientY } = 'touches' in event ? event.touches[0] : event;
		const deltaX = clientX - dragStartX;
		const deltaY = clientY - dragStartY;
		draggedDistance.set({ x: deltaX, y: deltaY });

		swipeDirection = deltaX > 20 ? 'right' : deltaX < -20 ? 'left' : null;
	}

	async function handleDragEnd() {
		if (!draggedCard) return;
		const { x } = $draggedDistance;
		if (Math.abs(x) > 100) {
			await handleSwipe(x > 0 ? 'right' : 'left');
		} else {
			draggedDistance.set({ x: 0, y: 0 });
		}
		window.removeEventListener('mousemove', handleDrag);
		window.removeEventListener('touchmove', handleDrag);
		window.removeEventListener('mouseup', handleDragEnd);
		window.removeEventListener('touchend', handleDragEnd);
		draggedCard = null;
		swipeDirection = null;
	}

	async function handleSwipe(direction: 'left' | 'right') {
		if (!resp.potentialMatches[currentIndex]) return;
		const success = await swipe(direction, resp.potentialMatches[currentIndex].userId);
		if (success) {
			currentIndex = 0;
			currentImageIndex = 0;
			draggedDistance.set({ x: 0, y: 0 });
		}
	}

	function nextImage() {
		if (!currentMatch) return;
		const totalImages = 1 + (currentMatch.otherImages?.length || 0);
		currentImageIndex = (currentImageIndex + 1) % totalImages;
	}

	function prevImage() {
		if (!currentMatch) return;
		const totalImages = 1 + (currentMatch.otherImages?.length || 0);
		currentImageIndex = (currentImageIndex - 1 + totalImages) % totalImages;
	}
</script>

<div
	class="relative mx-auto mt-6 h-[600px] w-full max-w-md overflow-hidden rounded-xl bg-card shadow-lg"
>
	{#each resp.potentialMatches.slice(currentIndex, currentIndex + 3) as match, index (match.id)}
		<div
			animate:flip={{ duration: 300 }}
			class="absolute left-0 top-0 h-full w-full"
			style="z-index: {3 - index};"
		>
			<div
				tabindex="0"
				role="button"
				aria-roledescription="draggable card"
				class={cn(
					'h-full w-full overflow-hidden rounded-xl bg-card transition-all duration-300',
					index === 0 && swipeDirection === 'left' && 'border-l-4 border-red-500',
					index === 0 && swipeDirection === 'right' && 'border-r-4 border-green-500'
				)}
				style="transform: translate({index === 0 ? $draggedDistance.x : 0}px, {index === 0
					? $draggedDistance.y
					: 0}px) rotate({index === 0 ? $draggedDistance.x * 0.1 : 0}deg);"
				onmousedown={index === 0 ? handleDragStart : undefined}
				ontouchstart={index === 0 ? handleDragStart : undefined}
			>
				<div class="relative h-3/4 w-full">
					{#if index === 0}
						{#key currentImageIndex}
							<img
								in:fade={{ duration: 300 }}
								src={currentImageIndex === 0
									? match.mainImageUrl || '/default-avatar.png'
									: match.otherImages?.[currentImageIndex - 1] || '/default-avatar.png'}
								alt={`${match.user.username} - Image ${currentImageIndex + 1}`}
								class="h-full w-full object-cover"
							/>
						{/key}
						<button
							class="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-md transition-colors hover:bg-background"
							onclick={prevImage}
						>
							<Icon icon="mdi:chevron-left" class="h-6 w-6 text-foreground" />
						</button>
						<button
							class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-md transition-colors hover:bg-background"
							onclick={nextImage}
						>
							<Icon icon="mdi:chevron-right" class="h-6 w-6 text-foreground" />
						</button>
					{:else}
						<img
							src={match.mainImageUrl || '/default-avatar.png'}
							alt={match.user.username}
							class="h-full w-full object-cover"
						/>
					{/if}
				</div>
				<div class="p-4">
					<h3 class="text-xl font-semibold text-foreground">
						{match.user.username}, {calculateAge(match.user.birthday)}
					</h3>
					<p class="text-sm text-muted-foreground">
						{match.user.cityName ? `${match.user.cityName}, ` : ''}
						{match.user.countryName || 'Location not specified'}
					</p>
					<p class="mt-2 text-sm text-muted-foreground">
						{match.distance.toFixed(1)}
						km away
					</p>
				</div>
			</div>
		</div>
	{/each}
</div>

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

{#if resp.isLoading}
	<div class="mt-4 text-center" in:fade>
		<p class="text-muted-foreground">Loading more matches...</p>
	</div>
{/if}

{#if resp.error}
	<div class="mt-4 text-center text-red-500" in:fly={{ y: 20, duration: 300 }}>
		<p>Error loading matches. Please try again.</p>
	</div>
{/if}

{#if !resp.hasMore && currentIndex >= resp.potentialMatches.length}
	<div class="mt-4 text-center" in:fade>
		<p class="text-muted-foreground">No more matches available at the moment.</p>
	</div>
{/if}
