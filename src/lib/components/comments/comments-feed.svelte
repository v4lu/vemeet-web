<script lang="ts">
	import type { Comment as CommentType } from '$lib/types/comment.types';
	import { Comment } from '.';

	type CommentsFeedProps = {
		comments: CommentType[];
		postId: number;
		authToken: string;
	};

	let { comments, postId, authToken }: CommentsFeedProps = $props();

	let topLevelComments = $derived(comments.filter((comment) => comment.parentId === null));

	function handleCommentDelete(commentId: number) {
		comments = comments.filter((c) => c.id !== commentId);
	}

	function handleCommentUpdate(updatedComment: CommentType) {
		comments = comments.map((c) => (c.id === updatedComment.id ? updatedComment : c));
	}
</script>

<div class="border-t border-border pb-4">
	<h4 class="p-4 font-semibold">Comments</h4>
	<div class="space-y-4">
		{#each topLevelComments as comment (comment.id)}
			<Comment
				{comment}
				{postId}
				{authToken}
				onCommentDelete={handleCommentDelete}
				onCommentUpdate={handleCommentUpdate}
			/>
		{/each}
	</div>
</div>
