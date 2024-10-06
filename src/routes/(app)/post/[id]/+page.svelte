<script lang="ts">
	import { useSignlePost } from '$lib/api/use-single-post.svelte.js';
	import { CommentsFeed, CreateComment } from '$lib/components/comments';
	import { PostGallery, PostLikes } from '$lib/components/post';
	import { PostSkeleton } from '$lib/components/skeleton';
	import { Avatar } from '$lib/components/ui/avatar/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
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
		<div
			class="mx-4 mb-6 overflow-hidden rounded-xl border border-border bg-card shadow-lg transition-all duration-300 hover:shadow-xl"
		>
			<div class="relative">
				{#if res.post.user.id === $sessionStore.id}
					<div class="absolute right-3 top-3 z-10">
						<Dropdown
							triggerIcon="solar:menu-dots-bold"
							bind:isOpen={isSettingsOpen}
							triggerClass="size-8 flex min-w-0 p-0 shadow-none justify-center bg-none rounded-full hover:bg-none transition-colors border-none"
							triggerIconClass="m-0 p-0 size-5 hover:text-primary"
							class="right-0 top-10"
						>
							<div class="flex w-full flex-col gap-1 p-1">
								<Button variant="ghost" class="flex w-full justify-start" size="sm">
									<Icon icon="solar:pen-bold" class="mr-2" />
									Edit
								</Button>
								<Button
									variant="ghost"
									class="flex w-full justify-start text-destructive transition-colors hover:bg-destructive/10 hover:text-destructive"
									size="sm"
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
						<Avatar class="mr-3 size-12" user={res.post.user} />
						<div>
							<a
								href={`/profile/${res.post.user.id}`}
								class="font-semibold text-foreground transition-colors duration-200 hover:text-primary"
								>{res.post.user.username}</a
							>
							<p class="text-xs text-muted-foreground">{formatTimestamp(res.post.createdAt)}</p>
						</div>
					</div>
				</div>

				{#if res.post.images && res.post.images.length > 0}
					<PostGallery images={res.post.images} />
				{/if}

				<p class="mb-4 px-4 text-foreground">{res.post.content}</p>

				<div class="flex items-center justify-between border-t border-border p-4">
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
		desc="Deleting content is a permanent action. Post will be removed and cannot be recovered."
		onClose={() => (isDeleteModalConfirmOpen = false)}
		onConfirm={deletePost}
		submitting={res.isPostDeletionSubmitting}
		confirmText="Delete Post"
	/>
{/if}
