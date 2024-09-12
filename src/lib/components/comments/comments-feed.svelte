<script lang="ts">
	import type { Comment as CommentType } from '$lib/types/comment.types';
	import { Comment } from '.';

	type CommentsFeedProps = {
		comments: CommentType[];
		postId: number;
		authToken: string;
	};

	let { comments, postId, authToken }: CommentsFeedProps = $props();

	let topLevelComments = $derived(comments.filter((comment) => comment.parentId === null).slice());
</script>

<div class="border-t border-gray-200">
	<h4 class="p-4 font-semibold">Comments</h4>
	<div class="space-y-4 px-2">
		{#each topLevelComments as comment (comment.id)}
			<Comment {comment} {postId} {authToken} />
		{/each}
	</div>
</div>
