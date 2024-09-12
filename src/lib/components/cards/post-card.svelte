<script lang="ts">
	import type { Post } from '$lib/types/post.types';
	import Icon from '@iconify/svelte';
	import { formatDistanceToNow } from 'date-fns';
	import { elasticOut } from 'svelte/easing';
	import { fade, slide } from 'svelte/transition';
	import { Dropdown } from '../ui/dropdown';
	import { ImageModal } from '../ui/modals';

	type PostCardProps = {
		post: Post;
	};

	let { post }: PostCardProps = $props();
	let isSettingsOpen = $state(false);
	let currentImageIndex = $state(0);
	let isModalOpen = $state(false);

	let hasNextImage = $derived(currentImageIndex < post.images.length - 1);
	let hasPrevImage = $derived(currentImageIndex > 0);

	function formatTimestamp(timestamp: string): string {
		return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
	}

	function handleDelete() {
		isSettingsOpen = false;
	}

	function handleUpdate() {
		isSettingsOpen = false;
	}

	function nextImage() {
		if (currentImageIndex < post.images.length - 1) {
			currentImageIndex++;
		}
	}

	function prevImage() {
		if (currentImageIndex > 0) {
			currentImageIndex--;
		}
	}

	function setImage(index: number) {
		currentImageIndex = index;
	}
</script>

<div
	class="mb-4 overflow-hidden rounded-lg border border-border bg-card shadow transition-shadow hover:shadow-md"
>
	<div class="relative">
		<div class="absolute right-2 top-2 z-10">
			<Dropdown
				triggerIcon="solar:menu-dots-bold"
				bind:isOpen={isSettingsOpen}
				triggerClass="size-6 flex min-w-0 p-0 justify-center"
				triggerIconClass="m-0 p-0"
				class="right-0 top-8"
			>
				<div class="flex w-full flex-col gap-1">
					<button
						class="flex w-full items-center rounded-sm px-2 py-1 text-sm text-destructive transition-colors hover:bg-destructive/10"
						onclick={handleDelete}
					>
						<Icon icon="lucide:trash-2" class="mr-2" />
						Delete
					</button>
					<button
						class="flex w-full items-center rounded-sm px-2 py-1 text-sm transition-colors hover:bg-accent"
						onclick={handleUpdate}
					>
						<Icon icon="lucide:pencil" class="mr-2" />
						Edit
					</button>
				</div>
			</Dropdown>
		</div>
		<div class="relative mb-4 flex items-center justify-between px-4 pt-4">
			<div class="flex items-center">
				<img
					src={post.user.profileImage ? post.user.profileImage.url : '/placeholder-user.webp'}
					alt={post.user.username}
					class="mr-3 h-10 w-10 rounded-full object-cover"
				/>
				<div>
					<h3 class="font-semibold text-foreground">{post.user.username}</h3>
					<p class="text-xs text-muted-foreground">{formatTimestamp(post.createdAt)}</p>
				</div>
			</div>
		</div>

		{#if post.images && post.images.length > 0}
			<div class="relative mb-4">
				<div
					role="button"
					tabindex="0"
					aria-label="Open image gallery"
					aria-describedby="image-description"
					onkeydown={(e) => e.key === 'Enter' && (isModalOpen = true)}
					onclick={() => (isModalOpen = true)}
					class="h-[15rem] w-full overflow-hidden"
				>
					{#key currentImageIndex}
						<img
							src={post.images[currentImageIndex].url}
							alt="Post"
							class="h-[15rem] w-full object-cover object-center"
							in:slide={{
								duration: 300,
								axis: 'x'
							}}
							out:fade={{ duration: 200, easing: elasticOut }}
						/>
					{/key}
				</div>
				{#if post.images.length > 1}
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
				{/if}
			</div>
			{#if post.images.length > 1}
				<div class="mb-2 flex justify-center space-x-1">
					{#each post.images as _, index}
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
		<p class="mb-4 px-4 text-foreground">{post.content}</p>
		<div class="flex items-center justify-between border-t border-border p-4 pt-3">
			<button
				class="flex items-center text-sm text-muted-foreground transition-colors hover:text-primary"
			>
				<Icon icon="lucide:heart" class="mr-1.5" />
				<span>Like</span>
			</button>
			<button
				class="flex items-center text-sm text-muted-foreground transition-colors hover:text-primary"
			>
				<Icon icon="lucide:message-circle" class="mr-1.5" />
				<span>Comment</span>
			</button>
			<button
				class="flex items-center text-sm text-muted-foreground transition-colors hover:text-primary"
			>
				<Icon icon="lucide:share" class="mr-1.5" />
				<span>Share</span>
			</button>
		</div>
	</div>
</div>

{#if isModalOpen}
	<ImageModal
		src={post.images[currentImageIndex].url}
		alt="Full size post image"
		onClose={() => (isModalOpen = false)}
	/>
{/if}
