<script lang="ts">
	import { api, createAuthHeaders } from '$lib/api';
	import { cn } from '$lib/cn';
	import { formatTimestamp } from '$lib/date';
	import { toast } from '$lib/stores/toast.store';
	import type { Comment as CommentType } from '$lib/types/comment.types';
	import { Button } from '../ui/button';
	import { inputVariants } from '../ui/input';

	type CommentProps = {
		comment: CommentType;
		depth?: number;
		postId: number;
		authToken: string;
	};

	let { comment, depth = 0, postId, authToken }: CommentProps = $props();
	let isReplying = $state(false);
	let replyContent = $state('');
	let submitting = $state(false);

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
</script>

<div class="mb-4 rounded border-l-2 pl-4" style="margin-left: {depth * 20}px;">
	<div class="flex items-center space-x-3">
		<img
			src={comment.user.profileImage ? comment.user.profileImage.url : '/placeholder-user.webp'}
			alt={comment.user.username}
			class="h-8 w-8 rounded-full object-cover"
		/>
		<div class="flex-1">
			<div class="rounded-lg bg-accent p-3">
				<div class="flex items-center justify-between">
					<p class="font-semibold">{comment.user.username}</p>
					<p class="text-xs text-gray-500">{formatTimestamp(comment.createdAt)}</p>
				</div>
				<p class="mt-1 text-sm">{comment.content}</p>
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
				<div class="mt-2">
					<textarea
						bind:value={replyContent}
						placeholder="Write a reply..."
						class={cn(inputVariants(), 'h-20 resize-none')}
						rows="2"
					></textarea>
					<div class="mt-2 flex justify-end space-x-2">
						<Button size="sm" variant="outline" onclick={() => (isReplying = false)}>Cancel</Button>
						<Button
							size="sm"
							isLoading={submitting}
							onclick={handleReply}
							disabled={submitting || !replyContent.trim()}
						>
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
				<svelte:self comment={reply} depth={depth + 1} {postId} {authToken} />
			{/each}
		</div>
	{/if}
</div>
