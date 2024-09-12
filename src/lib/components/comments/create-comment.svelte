<script lang="ts">
	import { api, createAuthHeaders } from '$lib/api';
	import { cn } from '$lib/cn';
	import { toast } from '$lib/stores/toast.store';
	import type { Comment } from '$lib/types/comment.types';
	import { Button } from '../ui/button';
	import { inputVariants } from '../ui/input';

	type CreateCommentProp = {
		postId: number;
		authToken: string;
		onCommentCreated: (newComment: Comment) => void;
	};

	let { authToken, onCommentCreated, postId }: CreateCommentProp = $props();

	let newComment = $state('');
	let isSubmitting = $state(false);

	async function handleSubmitComment() {
		if (!newComment.trim() || isSubmitting) return;

		isSubmitting = true;
		try {
			const response = await api
				.post<Comment>(`comments/posts/${postId}/comments`, {
					json: { content: newComment },
					headers: createAuthHeaders(authToken)
				})
				.json();

			onCommentCreated(response);
			newComment = '';
			toast.success('Comment posted successfully!');
		} catch (error) {
			console.error('Error posting comment:', error);
			toast.error('Failed to post comment. Please try again.');
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="border-t border-border p-4">
	<h4 class="mb-2 font-semibold">Add a comment</h4>
	<textarea
		bind:value={newComment}
		placeholder="What's on your mind?"
		rows="4"
		class={cn(inputVariants({ variant: 'empty' }), 'h-24 resize-none')}
	></textarea>
	<div class="flex w-full justify-end">
		<Button size="sm" onclick={handleSubmitComment} disabled={isSubmitting || !newComment.trim()}>
			{isSubmitting ? 'Posting...' : 'Post Comment'}
		</Button>
	</div>
</div>
