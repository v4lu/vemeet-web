<script lang="ts">
	import type { Image } from '$lib/types/image.types';
	import Icon from '@iconify/svelte';
	import { elasticOut } from 'svelte/easing';
	import { fade, slide } from 'svelte/transition';
	import { ImageModal } from '../ui/modals';

	type PostGalleryProps = {
		images: Image[];
	};
	let { images }: PostGalleryProps = $props();

	let isImageModalOpen = $state(false);
	let currentImageIndex = $state(0);
	let hasNextImage = $derived(currentImageIndex < images.length - 1);
	let hasPrevImage = $derived(currentImageIndex > 0);

	function nextImage() {
		if (hasNextImage) currentImageIndex++;
	}

	function prevImage() {
		if (hasPrevImage) currentImageIndex--;
	}

	function setImage(index: number) {
		currentImageIndex = index;
	}
</script>

<div class="relative mb-4">
	<div
		role="button"
		tabindex="0"
		aria-label="Open image gallery"
		aria-describedby="image-description"
		onkeydown={(e) => e.key === 'Enter' && (isImageModalOpen = true)}
		onclick={() => (isImageModalOpen = true)}
		class="h-[15rem] w-full overflow-hidden"
	>
		{#key currentImageIndex}
			<img
				src={images[currentImageIndex].url}
				alt="Post"
				class="h-[15rem] w-full object-cover object-center"
				in:slide={{ duration: 300, axis: 'x' }}
				out:fade={{ duration: 200, easing: elasticOut }}
			/>
		{/key}
	</div>
	{#if images.length > 1}
		{#if hasPrevImage}
			<button
				class="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
				onclick={prevImage}
			>
				<Icon class="size-4" icon="lucide:chevron-left" />
			</button>
		{/if}
		{#if hasNextImage}
			<button
				class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
				onclick={nextImage}
			>
				<Icon class="size-4" icon="lucide:chevron-right" />
			</button>
		{/if}
		{#if images.length > 1}
			<div class="mb-2 flex justify-center space-x-1 pt-4">
				{#each images as _, index}
					<button
						class="h-2 w-2 rounded-full transition-colors"
						class:bg-primary={index === currentImageIndex}
						class:bg-gray-300={index !== currentImageIndex}
						onclick={() => setImage(index)}
					></button>
				{/each}
			</div>
		{/if}
	{/if}
</div>

{#if isImageModalOpen}
	<ImageModal
		src={images[currentImageIndex].url}
		alt="Full size post image"
		onClose={() => (isImageModalOpen = false)}
	/>
{/if}
