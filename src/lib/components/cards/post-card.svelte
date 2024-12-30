<script lang="ts">
	import Icon from '@iconify/svelte';
	import { elasticOut } from 'svelte/easing';
	import { fade, slide } from 'svelte/transition';
	import { Avatar } from '../ui/avatar';
	import { Button } from '../ui/button';
	import { Dropdown } from '../ui/dropdown';
	import { ConfirmModal, ImageModal, Modal } from '../ui/modals';
	import UserHorizontalCard from './user-horizontal-card.svelte';
	import type { Post } from '$lib/types/post.types';
	import { sessionStore } from '$lib/stores/session.store';
	import { formatTimestamp } from '$lib/date';
	import { cn } from '$lib/cn';

	type PostCardProps = {
		post: Post;
		deletePost?: (id: number) => void;
		isPostDeleteing?: boolean;
		postLikeToggle: (postId: number, isLiked: boolean) => Promise<void>;
	};

	let { post, deletePost, postLikeToggle, isPostDeleteing }: PostCardProps = $props();
	let isSettingsOpen = $state(false);
	let currentImageIndex = $state(0);
	let isImageModalOpen = $state(false);
	let isDeleteModalConfirmOpen = $state(false);

	let submittingLike = $state(false);
	let isLikeModalOpen = $state(false);

	let isLiked = $state(
		post.reactions.some(
			(reaction) => reaction.user.id === $sessionStore.id && reaction.reactionType === 'LIKE'
		)
	);

	let hasNextImage = $derived(currentImageIndex < post.images.length - 1);
	let hasPrevImage = $derived(currentImageIndex > 0);

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

	async function handleToggleLike() {
		await postLikeToggle(post.id, isLiked);
		isLiked = !isLiked;
	}

	async function handleDeletePost() {
		if (deletePost) {
			deletePost(post.id);
			isDeleteModalConfirmOpen = false;
		}
	}
</script>

<div
	class="mb-6 rounded-xl border border-border bg-card shadow-lg transition-all duration-300 hover:shadow-xl"
>
	<div class="relative">
		{#if post.user.id === $sessionStore.id}
			<div class="absolute right-3 top-3 z-10">
				<Dropdown
					triggerIcon="solar:menu-dots-bold"
					bind:isOpen={isSettingsOpen}
					triggerClass="size-8 flex min-w-0 p-0 shadow-none justify-center bg-none rounded-full hover:bg-none transition-colors border-none"
					triggerIconClass="m-0 p-0 size-5 hover:text-primary"
					class="right-0 top-10"
				>
					<div class="flex w-full flex-col gap-1 p-1">
						<Button
							variant="ghost"
							class="flex w-full justify-start"
							size="sm"
							onclick={handleUpdate}
						>
							<Icon icon="solar:pen-bold" class="mr-2" />
							Edit
						</Button>
						<Button
							variant="ghost"
							size="sm"
							class="flex w-full justify-start text-destructive transition-colors hover:bg-destructive/10 hover:text-destructive"
							onclick={() => {
								isDeleteModalConfirmOpen = true;
								isSettingsOpen = false;
							}}
						>
							<Icon icon="solar:trash-bin-2-bold" class="mr-2" />
							Delete
						</Button>
					</div>
				</Dropdown>
			</div>
		{/if}

		<div class="relative mb-4 flex items-center justify-between p-4">
			<div class="flex items-center">
				<a href={`/profile/${post.user.id}`}>
					<Avatar class="mr-3 size-12" user={post.user} />
				</a>

				<div>
					<a
						href={`/profile/${post.user.id}`}
						class="font-semibold text-foreground transition-colors duration-200 hover:text-primary"
						>{post.user.username}</a
					>
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
					onkeydown={(e) => e.key === 'Enter' && (isImageModalOpen = true)}
					onclick={() => (isImageModalOpen = true)}
					class="h-[20rem] w-full overflow-hidden"
				>
					{#key currentImageIndex}
						<img
							src={post.images[currentImageIndex].url}
							alt="Post"
							class="h-full w-full object-cover object-center transition-transform duration-300 hover:scale-105"
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
							class="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
							onclick={prevImage}
						>
							<Icon class="size-5" icon="lucide:chevron-left" />
						</button>
					{/if}
					{#if hasNextImage}
						<button
							class="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
							onclick={nextImage}
						>
							<Icon class="size-5" icon="lucide:chevron-right" />
						</button>
					{/if}
				{/if}
			</div>
			{#if post.images.length > 1}
				<div class="mb-3 flex justify-center space-x-1.5">
					{#each post.images as _, index}
						<button
							aria-labelledby="image-description"
							class="h-2.5 w-2.5 rounded-full transition-colors"
							class:bg-primary={index === currentImageIndex}
							class:bg-gray-300={index !== currentImageIndex}
							onclick={() => setImage(index)}
						></button>
					{/each}
				</div>
			{/if}
		{/if}
		<p class="mb-4 px-4 text-foreground">{post.content}</p>
		<div class="flex items-center justify-between border-t border-border p-4">
			<div class="flex w-full items-center justify-between">
				<div class="flex items-center space-x-4">
					<button
						class="group flex items-center text-sm transition-colors"
						onclick={handleToggleLike}
						disabled={submittingLike}
					>
						<Icon
							icon={isLiked ? 'solar:heart-angle-bold' : 'solar:heart-angle-line-duotone'}
							class={cn(
								'size-6 transition-colors',
								isLiked ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
							)}
						/>
						<span class="ml-1.5 font-medium">{post.reactions.length}</span>
					</button>
					<a
						href={`/post/${post.id}`}
						class="flex items-center text-sm text-muted-foreground transition-colors hover:text-primary"
					>
						<Icon icon="solar:chat-round-line-bold" class="size-6" />
						<span class="ml-1.5 font-medium">
							{post.comments.length ?? '0'}
						</span>
					</a>
				</div>
				<button
					disabled={true}
					class="flex cursor-not-allowed
                     items-center text-sm text-muted-foreground transition-colors hover:text-primary"
				>
					<Icon icon="solar:multiple-forward-right-bold" class="size-6" />
					<span class="ml-1.5 font-medium">Share</span>
				</button>
			</div>
		</div>
	</div>
</div>

{#if isImageModalOpen}
	<ImageModal
		src={post.images[currentImageIndex].url}
		alt="Full size post image"
		onClose={() => (isImageModalOpen = false)}
	/>
{/if}

{#if isDeleteModalConfirmOpen}
	<ConfirmModal
		title="Delete Content"
		desc="Deleting content is a permanent action. Post will be removed and cannot be recovered."
		onClose={() => (isDeleteModalConfirmOpen = false)}
		onConfirm={handleDeletePost}
		submitting={isPostDeleteing}
		confirmText="Delete Post"
	/>
{/if}

{#if isLikeModalOpen}
	<Modal onClose={() => (isLikeModalOpen = false)}>
		<div class="hide-scrollbar max-h-[25rem] overflow-y-auto">
			<h2 class="mb-4 text-xl font-semibold">Likes</h2>
			<div class="grid gap-2">
				{#each post.reactions as { user }}
					<UserHorizontalCard {user} />
				{/each}
			</div>
		</div>
	</Modal>
{/if}

<style lang="postcss">
	.hide-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}

	.hide-scrollbar::-webkit-scrollbar {
		display: none;
	}
</style>
