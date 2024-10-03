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
		class={cn(
			inputVariants({ variant: 'empty' }),
			'h-24 w-full resize-none rounded-lg border-2 border-transparent bg-muted/50 p-3 transition-all duration-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary'
		)}
	></textarea>
	<div class="mt-2 flex w-full justify-end">
		<Button size="sm" onclick={handleSubmitComment} disabled={isSubmitting || !newComment.trim()}>
			{isSubmitting ? 'Posting...' : 'Post Comment'}
		</Button>
	</div>
</div>
