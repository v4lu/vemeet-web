<script lang="ts">
	import { useProfileMedia } from '$lib/api/use-profile-media.svelte';
	import { sessionStore } from '$lib/stores/session.store';
	import type { Image } from '$lib/types/image.types';
	import { ImageModal } from '../ui/modals';
	import { Skeleton } from '../ui/skeleton';

	type ProfileMediaProps = {
		authToken: string;
	};

	let { authToken }: ProfileMediaProps = $props();
	let { resp } = useProfileMedia(authToken, $sessionStore.id);
	let selectedImage = $state<Image | null>(null);

	function openImageModal(image: Image) {
		selectedImage = image;
	}

	function closeImageModal() {
		selectedImage = null;
	}
</script>

<div class="pt-2">
	{#if resp.isLoading}
		<div class="grid grid-cols-3 gap-4 md:grid-cols-3 lg:grid-cols-4">
			{#each Array(12) as _}
				<Skeleton class="h-[220px] w-full rounded-lg" />
			{/each}
		</div>
	{:else if resp.media.length === 0}
		<div class="flex h-64 items-center justify-center">
			<p class="text-lg">No images found.</p>
		</div>
	{:else}
		<div class="grid grid-cols-3 gap-4 md:grid-cols-3 lg:grid-cols-4">
			{#each resp.media as image (image.id)}
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
