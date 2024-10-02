<script lang="ts">
	import { useSwiperMode } from '$lib/api/use-swipper-mode.svelte';
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';
	import { flip } from 'svelte/animate';
	import { spring } from 'svelte/motion';

	type Props = {
		authToken: string;
	};

	let { authToken }: Props = $props();
	const { resp, getPotentialMatches, swipe, loadMoreMatches } = useSwiperMode(authToken);

	let currentIndex = $state(0);
	let draggedCard = $state<HTMLElement | null>(null);
	let dragStartX = $state(0);
	let dragStartY = $state(0);
	let draggedDistance = spring({ x: 0, y: 0 }, { stiffness: 0.2, damping: 0.4 });

	let currentMatch = $derived(resp.potentialMatches[currentIndex]);

	function calculateAge(birthday: string): number {
		const birthDate = new Date(birthday);
		const today = new Date();
		let age = today.getFullYear() - birthDate.getFullYear();
		const monthDifference = today.getMonth() - birthDate.getMonth();

		if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
			age--;
		}

		return age;
	}

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
	}

	async function handleSwipe(direction: 'left' | 'right') {
		if (!currentMatch) return;
		await swipe(direction, currentMatch.user.id);
		currentIndex++;
		draggedDistance.set({ x: 0, y: 0 });
		if (currentIndex >= resp.potentialMatches.length - 3) {
			loadMoreMatches();
		}
	}

	// Initial load of potential matches
	$effect(() => {
		getPotentialMatches();
	});
</script>

<div class="relative mx-auto h-[600px] w-full max-w-md overflow-hidden">
	{#each resp.potentialMatches.slice(currentIndex, currentIndex + 3) as match, index (match.user.id)}
		<div
			animate:flip={{ duration: 300 }}
			class="absolute left-0 top-0 h-full w-full"
			style="z-index: {3 - index};"
		>
			<div
				class="h-full w-full overflow-hidden rounded-lg bg-white shadow-lg"
				style="transform: translate({index === 0 ? $draggedDistance.x : 0}px, {index === 0
					? $draggedDistance.y
					: 0}px) rotate({index === 0 ? $draggedDistance.x * 0.1 : 0}deg);"
				on:mousedown={index === 0 ? handleDragStart : undefined}
				on:touchstart={index === 0 ? handleDragStart : undefined}
			>
				<img
					src={match.user.profileImage?.url || '/default-avatar.png'}
					alt={match.user.name || match.user.username}
					class="h-3/4 w-full object-cover"
				/>
				<div class="p-4">
					<h3 class="text-xl font-semibold">
						{match.user.name || match.user.username}, {calculateAge(match.user.birthday)}
					</h3>
					<p class="text-gray-600">{match.user.bio || 'No bio available'}</p>
					<p class="mt-2 text-sm text-gray-500">{match.distance.toFixed(1)} km away</p>
				</div>
			</div>
		</div>
	{/each}
</div>

<div class="mt-4 flex justify-center space-x-4">
	<Button onclick={() => handleSwipe('left')} class="rounded-full p-3">
		<Icon icon="mdi:close" class="h-6 w-6 text-red-500" />
	</Button>
	<Button onclick={() => handleSwipe('right')} class="rounded-full p-3">
		<Icon icon="mdi:heart" class="h-6 w-6 text-green-500" />
	</Button>
</div>

{#if resp.isLoading}
	<div class="mt-4 text-center">
		<p>Loading more matches...</p>
	</div>
{/if}

{#if resp.error}
	<div class="mt-4 text-center text-red-500">
		<p>Error loading matches. Please try again.</p>
	</div>
{/if}

{#if !resp.hasMore && currentIndex >= resp.potentialMatches.length}
	<div class="mt-4 text-center">
		<p>No more matches available at the moment.</p>
	</div>
{/if}
