<script lang="ts">
	import { cn } from '$lib/cn';
	import { formatTimestampShort } from '$lib/date';
	import { sessionStore } from '$lib/stores/session.store';
	import type { Comment as CommentType } from '$lib/types/comment.types';
	import Icon from '@iconify/svelte';
	import { Avatar } from '../ui/avatar';
	import { Button } from '../ui/button';
	import { Dropdown } from '../ui/dropdown';
	import { ConfirmModal } from '../ui/modals';
	import { Comment } from '.';
	import { spring } from 'svelte/motion';

	type CommentProps = {
		comment: CommentType;
		depth?: number;
		postReply: (parentId: number, content: string) => void;
		deleteComment: (commentId: number) => void;
		editComment: (commentId: number, content: string) => void;
		handleCommentLike: (isLike: boolean, commentId: number) => void;
		isSubmittingDeleteComment: boolean;
		isSubmittingEditComment: boolean;
		isSubmittingReply: boolean;
	};

	let {
		comment,
		depth = 0,
		postReply,
		isSubmittingReply,
		deleteComment,
		isSubmittingDeleteComment,
		editComment,
		isSubmittingEditComment,
		handleCommentLike
	}: CommentProps = $props();

	let isReplying = $state(false);
	let replyContent = $state('');
	let isSettingsOpen = $state(false);
	let isDeleteModalConfirmOpen = $state(false);
	let isEditing = $state(false);
	let editContent = $state(comment.content);
	const scale = spring(1);

	let isLiked = $state(
		comment.reactions.some(
			(reaction) => reaction.user.id === $sessionStore.id && reaction.reactionType === 'LIKE'
		)
	);

	$effect(() => {
		if (comment.replies) {
			comment.replies.sort(
				(a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
			);
		}
	});

	function handleReply() {
		if (!replyContent) return;
		postReply(comment.id, replyContent);
		replyContent = '';
		isReplying = false;
	}

	function handleDelete() {
		deleteComment(comment.id);
		isDeleteModalConfirmOpen = false;
	}

	function handleEdit() {
		if (!editContent) return;
		editComment(comment.id, editContent);
		isEditing = false;
	}

	function handleCommentLikeWithAnimation(isCurrentlyLiked: boolean, commentId: number) {
		scale.set(1.3).then(() => scale.set(1));
		handleCommentLike(isCurrentlyLiked, commentId);
	}
</script>

<div class="mb-4 rounded-lg border-l-2 border-primary pl-4" style="margin-left: {depth * 20}px;">
	<div class="flex items-start space-x-3">
		<Avatar class="size-10" user={comment.user} />
		<div class="flex-1">
			<div class=" rounded-xl border border-border bg-accent/30 p-3 shadow-sm">
				<div class="flex items-center justify-between">
					<a
						href={`/profile/${comment.user.id}`}
						class="font-semibold text-foreground transition-colors duration-200 hover:text-primary"
						>{comment.user.username}</a
					>
					<div class="flex items-center">
						<p class="mr-2 text-xs text-muted-foreground">
							{formatTimestampShort(comment.createdAt)}
						</p>
						{#if comment.user.id === $sessionStore.id}
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
										onclick={() => {
											isEditing = true;
											isSettingsOpen = false;
										}}
									>
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
						{/if}
					</div>
				</div>
				{#if isEditing}
					<textarea
						bind:value={editContent}
						class="mt-2 w-full rounded-lg border-2 border-transparent bg-background p-2 text-sm transition-all duration-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
						rows="3"
					></textarea>
					<div class="mt-2 flex justify-end space-x-2">
						<Button size="sm" variant="outline" onclick={() => (isEditing = false)}>Cancel</Button>
						<Button
							size="sm"
							onclick={handleEdit}
							disabled={isSubmittingEditComment || !editContent.trim()}
						>
							{isSubmittingEditComment ? 'Updating...' : 'Update'}
						</Button>
					</div>
				{:else}
					<p class="mt-1 text-sm text-foreground">{comment.content}</p>
				{/if}
				<div class="mt-2 flex items-center space-x-4">
					<button
						onclick={() => {
							handleCommentLikeWithAnimation(isLiked, comment.id);
							isLiked = !isLiked;
						}}
						class="group flex items-center text-sm transition-colors"
					>
						<div style="transform: scale({$scale})" class="transition-transform duration-300">
							<Icon
								icon={isLiked ? 'solar:heart-angle-bold' : 'solar:heart-angle-line-duotone'}
								class={cn(
									'mr-2 size-5 transition-all duration-200',
									isLiked ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
								)}
							/>
						</div>
						<span class="font-medium">{comment.reactions.length}</span>
					</button>
				</div>
			</div>
			{#if depth === 0}
				<button
					class="mt-2 text-sm text-primary transition-colors hover:text-primary/80"
					onclick={() => (isReplying = !isReplying)}
				>
					Reply
				</button>
			{/if}
			{#if isReplying}
				<div class="mt-3 pr-4">
					<textarea
						bind:value={replyContent}
						placeholder="Write a reply..."
						class="w-full rounded-lg border-2 border-transparent bg-muted/50 p-2 text-sm transition-all duration-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
						rows="2"
					></textarea>
					<div class="mt-2 flex justify-end space-x-2">
						<Button size="sm" variant="outline" onclick={() => (isReplying = false)}>Cancel</Button>
						<Button
							onclick={handleReply}
							size="sm"
							disabled={isSubmittingReply || !replyContent.trim()}
						>
							{isSubmittingReply ? 'Posting...' : 'Post Reply'}
						</Button>
					</div>
				</div>
			{/if}
		</div>
	</div>
	{#if comment.replies && comment.replies.length > 0}
		<div class="mt-3">
			{#each comment.replies as reply (reply.id)}
				<Comment
					comment={reply}
					depth={depth + 1}
					{deleteComment}
					{editComment}
					{handleCommentLike}
					{isSubmittingDeleteComment}
					{isSubmittingEditComment}
					postReply={() => {}}
					isSubmittingReply={false}
				/>
			{/each}
		</div>
	{/if}
</div>

{#if isDeleteModalConfirmOpen}
	<ConfirmModal
		title="Delete Comment"
		desc="Are you sure you want to delete this comment? This action cannot be undone."
		onClose={() => (isDeleteModalConfirmOpen = false)}
		onConfirm={handleDelete}
		confirmText="Delete Comment"
		submitting={isSubmittingDeleteComment}
	/>
{/if}
