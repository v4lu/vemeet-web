<script lang="ts">
	import { api, createAuthHeaders } from '$lib/api';
	import { sessionStore } from '$lib/stores/session.store';
	import type { Image } from '$lib/types/image.types';
	import { onMount } from 'svelte';
	import { ImageModal } from '../ui/modals';
	import { Skeleton } from '../ui/skeleton';

	type ProfileMediaProps = {
		authToken: string;
	};

	let { authToken }: ProfileMediaProps = $props();
	let isLoading = $state(false);
	let images = $state<Image[]>([]);
	let selectedImage = $state<Image | null>(null);

	async function loadImages() {
		if (isLoading) return;
		isLoading = true;
		try {
			const response = await api
				.get<Image[]>(`images/${$sessionStore.id}`, {
					headers: createAuthHeaders(authToken)
				})
				.json();
			images = response;
		} catch (error) {
			console.error('Error fetching images:', error);
		} finally {
			isLoading = false;
		}
	}

	function openImageModal(image: Image) {
		selectedImage = image;
	}

	function closeImageModal() {
		selectedImage = null;
	}

	onMount(() => {
		loadImages();
	});
</script>

<div class="pt-2">
	{#if isLoading}
		<div class="grid grid-cols-3 gap-4 md:grid-cols-3 lg:grid-cols-4">
			{#each Array(12) as _}
				<Skeleton class="h-[220px] w-full rounded-lg" />
			{/each}
		</div>
	{:else if images.length === 0}
		<div class="flex h-64 items-center justify-center">
			<p class="text-lg">No images found.</p>
		</div>
	{:else}
		<div class="grid grid-cols-3 gap-4 md:grid-cols-3 lg:grid-cols-4">
			{#each images as image (image.id)}
				<div
					role="button"
					tabindex="0"
					aria-label="Open image gallery"
					aria-describedby="image-description"
					onkeydown={(e) => e.key === 'Enter' && openImageModal(image)}
					class="aspect-square cursor-pointer overflow-hidden rounded-lg transition-opacity hover:opacity-80"
					onclick={() => openImageModal(image)}
				>
					<img
						src={image.url}
						alt="User uploaded"
						class="h-full w-full object-cover"
						loading="lazy"
					/>
				</div>
			{/each}
		</div>
	{/if}
</div>

{#if selectedImage}
	<ImageModal src={selectedImage.url} alt="Full size user image" onClose={closeImageModal} />
{/if}
