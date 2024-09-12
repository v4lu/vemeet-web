<script lang="ts">
	import { api, createAuthHeaders } from '$lib/api';
	import { cn } from '$lib/cn';
	import { formatTimestamp } from '$lib/date';
	import { sessionStore } from '$lib/stores/session.store';
	import { toast } from '$lib/stores/toast.store';
	import type { Comment } from '$lib/types/comment.types';
	import type { Post } from '$lib/types/post.types';
	import type { Reaction } from '$lib/types/reaction.types';
	import Icon from '@iconify/svelte';
	import { elasticOut } from 'svelte/easing';
	import { fade, slide } from 'svelte/transition';
	import { UserHorizontalCard } from '.';
	import { CommentsFeed, CreateComment } from '../comments';
	import { Dropdown } from '../ui/dropdown';
	import { ConfirmModal, ImageModal, Modal } from '../ui/modals';

	type PostBodyProps = {
		post: Post;
		onPostDelete: () => void;
		postId: number;
		authToken: string;
	};
	let { post, onPostDelete, postId, authToken }: PostBodyProps = $props();
	let isImageModalOpen = $state(false);
	let isSettingsOpen = $state(false);
	let isDeleteModalConfirmOpen = $state(false);
	let submittingPostDelete = $state(false);
	let currentImageIndex = $state(0);
	let hasNextImage = $derived(currentImageIndex < post.images.length - 1);
	let hasPrevImage = $derived(currentImageIndex > 0);

	let submittingLike = $state(false);
	let isLikeModalOpen = $state(false);

	let isLiked = $state(
		post.reactions.some(
			(reaction) => reaction.user.id === $sessionStore.id && reaction.reactionType === 'LIKE'
		)
	);

	function nextImage() {
		if (hasNextImage) currentImageIndex++;
	}

	function prevImage() {
		if (hasPrevImage) currentImageIndex--;
	}

	function setImage(index: number) {
		currentImageIndex = index;
	}

	async function handleDeletePost() {
		submittingPostDelete = true;
		try {
			await onPostDelete();
			isDeleteModalConfirmOpen = false;
		} catch (error) {
			console.error('Error deleting post:', error);
		} finally {
			submittingPostDelete = false;
		}
	}

	async function handleToggleLike() {
		if (submittingLike) return;
		submittingLike = true;
		try {
			if (isLiked) {
				await api
					.delete(`posts/${postId}/reactions`, {
						headers: createAuthHeaders(authToken)
					})
					.json();
				post = {
					...post,
					reactions: post.reactions.filter((r) => r.user.id !== $sessionStore.id)
				};
			} else {
				const res = await api
					.post<Reaction>(`posts/${postId}/reactions`, {
						json: { reactionType: 'LIKE' },
						headers: createAuthHeaders(authToken)
					})
					.json();
				post = {
					...post,
					reactions: [res, ...post.reactions]
				};
			}
			isLiked = !isLiked;
		} catch (error) {
			console.error('Error toggling like:', error);
			toast.error('Failed to update like status. Please try again.');
		} finally {
			submittingLike = false;
		}
	}

	function handleCommentCreated(newComment: Comment) {
		post = {
			...post,
			comments: [...post.comments, newComment]
		};
	}
</script>

<div class="mb-4 overflow-hidden rounded-lg border border-border bg-card shadow">
	<div class="relative">
		{#if post.user.id === $sessionStore.id}
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
							onclick={() => {
								isDeleteModalConfirmOpen = true;
								isSettingsOpen = false;
							}}
						>
							<Icon icon="lucide:trash-2" class="mr-2" />
							Delete
						</button>
						<button
							class="flex w-full items-center rounded-sm px-2 py-1 text-sm transition-colors hover:bg-accent"
						>
							<Icon icon="lucide:pencil" class="mr-2" />
							Edit
						</button>
					</div>
				</Dropdown>
			</div>
		{/if}
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
					onkeydown={(e) => e.key === 'Enter' && (isImageModalOpen = true)}
					onclick={() => (isImageModalOpen = true)}
					class="h-[15rem] w-full overflow-hidden"
				>
					{#key currentImageIndex}
						<img
							src={post.images[currentImageIndex].url}
							alt="Post"
							class="h-[15rem] w-full object-cover object-center"
							in:slide={{ duration: 300, axis: 'x' }}
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
					{#if post.images.length > 1}
						<div class="mb-2 flex justify-center space-x-1 pt-4">
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
			</div>
		{/if}
		<p class="mb-4 px-4 text-foreground">{post.content}</p>
		<div class="flex items-center justify-between border-t border-border p-4 pt-3">
			<div class="flex items-center">
				<button
					class="group mr-2 flex items-center text-sm transition-colors"
					onclick={handleToggleLike}
					disabled={submittingLike}
				>
					<Icon
						icon={isLiked ? 'solar:heart-angle-bold' : 'solar:heart-angle-line-duotone'}
						class={cn(
							'size-5 transition-colors',
							isLiked ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
						)}
					/>
				</button>
				<button
					class="text-sm text-muted-foreground hover:text-primary"
					onclick={() => {
						if (post.reactions.length > 0) {
							isLikeModalOpen = true;
						}
					}}
				>
					{post.reactions.length} Likes
				</button>
			</div>
		</div>

		<CreateComment {postId} {authToken} onCommentCreated={handleCommentCreated} />
		<CommentsFeed comments={post.comments} postId={post.id} {authToken} />
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
		desc="Deleting content is a permanent action.Post will be removed and cannot be recovered."
		onClose={() => (isDeleteModalConfirmOpen = false)}
		onConfirm={handleDeletePost}
		submitting={submittingPostDelete}
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
		-ms-overflow-style: none; /* IE and Edge */
		scrollbar-width: none; /* Firefox */
	}

	.hide-scrollbar::-webkit-scrollbar {
		display: none; /* Chrome, Safari and Opera */
	}
</style>
