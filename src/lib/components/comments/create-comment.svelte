<script lang="ts">
	import { cn } from '$lib/cn';
	import { Button } from '../ui/button';
	import { inputVariants } from '../ui/input';

	type CreateCommentProp = {
		isSubmitting: boolean;
		postComment: (newComment: string) => void;
	};

	let { postComment, isSubmitting }: CreateCommentProp = $props();

	let newComment = $state('');

	async function handleSubmitComment() {
		if (!newComment.trim() || isSubmitting) return;
		postComment(newComment);
		newComment = '';
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
