<script lang="ts">
	import { api, createAuthHeaders } from '$lib/api';
	import { formatTimestamp } from '$lib/date';
	import { sessionStore } from '$lib/stores/session.store';
	import { toast } from '$lib/stores/toast.store';
	import type { Comment as CommentType } from '$lib/types/comment.types';
	import Icon from '@iconify/svelte';
	import { Button } from '../ui/button';
	import { Dropdown } from '../ui/dropdown';
	import { ConfirmModal } from '../ui/modals';

	type CommentProps = {
		comment: CommentType;
		depth?: number;
		postId: number;
		authToken: string;
		onCommentDelete: (commentId: number) => void;
	};

	let { comment, depth = 0, postId, authToken, onCommentDelete }: CommentProps = $props();
	let isReplying = $state(false);
	let replyContent = $state('');
	let submitting = $state(false);
	let isSettingsOpen = $state(false);
	let isDeleteModalConfirmOpen = $state(false);
	let isEditing = $state(false);
	let editContent = $state(comment.content);

	$effect(() => {
		if (comment.replies) {
			comment.replies.sort(
				(a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
			);
		}
	});

	async function handleReply() {
		if (!replyContent.trim() || submitting) return;

		submitting = true;
		try {
			const response = await api
				.post(`comments/posts/${postId}/comments`, {
					json: { content: replyContent, parentId: comment.id },
					headers: createAuthHeaders(authToken)
				})
				.json();

			comment = {
				...comment,
				replies: [...(comment.replies ?? []), response as CommentType]
			};
			replyContent = '';
			isReplying = false;
			toast.success('Reply added successfully!');
		} catch (error) {
			console.error('Error adding reply:', error);
			toast.error('Failed to add reply. Please try again.');
		} finally {
			submitting = false;
		}
	}

	async function handleEdit() {
		if (!editContent.trim() || submitting) return;

		submitting = true;
		try {
			const response = await api
				.patch<CommentType>(`comments/${comment.id}`, {
					json: { content: editContent },
					headers: createAuthHeaders(authToken)
				})
				.json();

			comment = { ...comment, content: response.content };
			isEditing = false;
			toast.success('Comment updated successfully!');
		} catch (error) {
			console.error('Error updating comment:', error);
			toast.error('Failed to update comment. Please try again.');
		} finally {
			submitting = false;
		}
	}

	async function handleDelete() {
		try {
			await api
				.delete(`comments/${comment.id}`, {
					headers: createAuthHeaders(authToken)
				})
				.json();

			onCommentDelete(comment.id);
			toast.success('Comment deleted successfully!');
		} catch (error) {
			console.error('Error deleting comment:', error);
			toast.error('Failed to delete comment. Please try again.');
		}
	}
</script>

<div class="mb-4 rounded border-l-2 border-border pl-4" style="margin-left: {depth * 20}px;">
	<div class="flex items-center space-x-3">
		<img
			src={comment.user.profileImage ? comment.user.profileImage.url : '/placeholder-user.webp'}
			alt={comment.user.username}
			class="h-8 w-8 rounded-full object-cover"
		/>
		<div class="flex-1">
			<div class="rounded-lg bg-gray-50 p-3">
				<div class="flex items-center justify-between">
					<p class="font-semibold">{comment.user.username}</p>
					<div class="flex items-center">
						<p class="mr-2 text-xs text-gray-500">{formatTimestamp(comment.createdAt)}</p>
						{#if comment.user.id === $sessionStore.id}
							<Dropdown
								triggerIcon="solar:menu-dots-bold"
								bind:isOpen={isSettingsOpen}
								triggerClass="size-6 flex min-w-0 p-0 justify-center"
								triggerIconClass="m-0 p-0"
								class="right-0 top-8"
							>
								<div class="flex w-full flex-col gap-1">
									<button
										class="flex w-full items-center rounded-sm px-2 py-1 text-sm transition-colors hover:bg-accent"
										onclick={() => {
											isEditing = true;
											isSettingsOpen = false;
										}}
									>
										<Icon icon="lucide:pencil" class="mr-2" />
										Edit
									</button>
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
								</div>
							</Dropdown>
						{/if}
					</div>
				</div>
				{#if isEditing}
					<textarea bind:value={editContent} class="mt-2 w-full rounded border p-2" rows="3"
					></textarea>
					<div class="mt-2 flex justify-end space-x-2">
						<Button size="sm" variant="outline" onclick={() => (isEditing = false)}>Cancel</Button>
						<Button size="sm" onclick={handleEdit} disabled={submitting || !editContent.trim()}>
							{submitting ? 'Updating...' : 'Update'}
						</Button>
					</div>
				{:else}
					<p class="mt-1 text-sm">{comment.content}</p>
				{/if}
			</div>
			{#if depth === 0}
				<button
					class="mt-1 text-xs text-primary hover:underline"
					onclick={() => (isReplying = !isReplying)}
				>
					Reply
				</button>
			{/if}
			{#if isReplying}
				<div class="mt-2 pr-4">
					<textarea
						bind:value={replyContent}
						placeholder="Write a reply..."
						class="w-full rounded border p-2 text-sm"
						rows="2"
					></textarea>
					<div class="mt-2 flex justify-end space-x-2">
						<Button size="sm" variant="outline" on:click={() => (isReplying = false)}>Cancel</Button
						>
						<Button size="sm" onclick={handleReply} disabled={submitting || !replyContent.trim()}>
							{submitting ? 'Posting...' : 'Post Reply'}
						</Button>
					</div>
				</div>
			{/if}
		</div>
	</div>
	{#if comment.replies && comment.replies.length > 0}
		<div class="mt-2">
			{#each comment.replies as reply (reply.id)}
				<svelte:self comment={reply} depth={depth + 1} {postId} {authToken} {onCommentDelete} />
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
	/>
{/if}
