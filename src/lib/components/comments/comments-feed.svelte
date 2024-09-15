<script lang="ts">
	import type { Comment as CommentType } from '$lib/types/comment.types';
	import { Comment } from '.';

	type CommentsFeedProps = {
		comments: CommentType[];
		postReply: (commentId: number, value: string) => void;
		isSubmittingReply: boolean;
		deleteComment: (commentId: number) => void;
		isSubmittingDeleteComment: boolean;
		editComment: (commentId: number, content: string) => void;
		isSubmittingEditComment: boolean;
		handleCommentLike: (isLike: boolean, commentId: number, userId: number) => void;
	};

	let {
		comments,
		isSubmittingReply,
		postReply,
		deleteComment,
		isSubmittingDeleteComment,
		editComment,
		isSubmittingEditComment,
		handleCommentLike
	}: CommentsFeedProps = $props();

	let topLevelComments = $derived(comments.filter((comment) => comment.parentId === null));
</script>

<div class="border-t border-border pb-4">
	<h4 class="p-4 font-semibold">Comments</h4>
	<div class="space-y-4">
		{#each topLevelComments as comment (comment.id)}
			<Comment
				{handleCommentLike}
				{editComment}
				{isSubmittingEditComment}
				{isSubmittingDeleteComment}
				{deleteComment}
				{comment}
				{postReply}
				{isSubmittingReply}
			/>
		{/each}
	</div>
</div>
