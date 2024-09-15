<script lang="ts">
	import { useSignlePost } from '$lib/api/use-single-post.svelte.js';
	import { CommentsFeed, CreateComment } from '$lib/components/comments';
	import { PostGallery, PostLikes } from '$lib/components/post';
	import { PostSkeleton } from '$lib/components/skeleton';
	import Dropdown from '$lib/components/ui/dropdown/dropdown.svelte';
	import { ConfirmModal } from '$lib/components/ui/modals/index.js';
	import { formatTimestamp } from '$lib/date.js';
	import { sessionStore } from '$lib/stores/session.store.js';
	import Icon from '@iconify/svelte';

	let { data } = $props();
	const {
		res,
		deletePost,
		handlePostLike,
		postComment,
		handleCommentLike,
		postReply,
		deleteComment,
		editComment
	} = useSignlePost(+data.id, data.accessToken);

	let isSettingsOpen = $state(false);
	let isDeleteModalConfirmOpen = $state(false);
</script>

<div class="mt-6">
	{#if res.isLoading}
		<PostSkeleton />
	{:else if res.post}
		<div class="mb-4 overflow-hidden rounded-lg border border-border bg-card shadow">
			<div class="relative">
				{#if res.post.user.id === $sessionStore.id}
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
							src={res.post.user.profileImage
								? res.post.user.profileImage.url
								: '/placeholder-user.webp'}
							alt={res.post.user.username}
							class="mr-3 h-10 w-10 rounded-full object-cover"
						/>
						<div>
							<h3 class="font-semibold text-foreground">{res.post.user.username}</h3>
							<p class="text-xs text-muted-foreground">{formatTimestamp(res.post.createdAt)}</p>
						</div>
					</div>
				</div>

				{#if res.post.images && res.post.images.length > 0}
					<PostGallery images={res.post.images} />
				{/if}
				<p class="mb-4 px-4 text-foreground">{res.post.content}</p>
				<div class="flex items-center justify-between border-t border-border p-4 pt-3">
					<PostLikes reactions={res.reactions} {handlePostLike} />
				</div>
			</div>
			<CreateComment isSubmitting={res.isCreateCommentSubmitting} {postComment} />
			<CommentsFeed
				{handleCommentLike}
				{deleteComment}
				{postReply}
				{editComment}
				isSubmittingEditComment={res.isEditCommentSubmitting}
				isSubmittingDeleteComment={res.isDeleteCommentSubmitting}
				isSubmittingReply={res.isCreateReplySubmitting}
				comments={res.comments}
			/>
		</div>
	{/if}
</div>

{#if isDeleteModalConfirmOpen}
	<ConfirmModal
		title="Delete Content"
		desc="Deleting content is a permanent action.Post will be removed and cannot be recovered."
		onClose={() => (isDeleteModalConfirmOpen = false)}
		onConfirm={deletePost}
		submitting={res.isPostDeletionSubmitting}
		confirmText="Delete Post"
	/>
{/if}
