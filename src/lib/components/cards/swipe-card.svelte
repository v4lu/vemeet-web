<script lang="ts">
	import { cn } from '$lib/cn';
	import { calculateAge } from '$lib/date';
	import type { SwipeProfile } from '$lib/types/user.types';
	import Icon from '@iconify/svelte';
	import { spring } from 'svelte/motion';
	import { fade } from 'svelte/transition';

	type Props = {
		index: number;
		match: SwipeProfile;
		onSwipe: (direction: 'left' | 'right') => void;
	};

	let { index, match, onSwipe }: Props = $props();

	let currentImageIndex = $state(0);
	let draggedCard = $state<HTMLElement | null>(null);
	let dragStartX = $state(0);
	let dragStartY = $state(0);
	let draggedDistance = spring({ x: 0, y: 0 }, { stiffness: 0.2, damping: 0.4 });
	let swipeDirection = $state<'left' | 'right' | null>(null);

	let totalImages = $derived(1 + (match.otherImages?.length || 0));
	let hasMultipleImages = $derived(totalImages > 1);

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

	function handleDragEnd() {
		if (!draggedCard) return;
		const { x } = $draggedDistance;
		if (Math.abs(x) > 100) {
			onSwipe(x > 0 ? 'right' : 'left');
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

	function nextImage() {
		currentImageIndex = (currentImageIndex + 1) % totalImages;
	}

	function prevImage() {
		currentImageIndex = (currentImageIndex - 1 + totalImages) % totalImages;
	}
</script>

<div
	class="border-1 relative mx-auto h-[27rem] w-full max-w-md overflow-hidden rounded-3xl border-border bg-card shadow-sm"
>
	<div
		tabindex="0"
		role="button"
		aria-roledescription="draggable card"
		class={cn(
			'h-full w-full overflow-hidden rounded-3xl bg-card transition-all duration-300',
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
				{#if hasMultipleImages}
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
				{/if}
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
