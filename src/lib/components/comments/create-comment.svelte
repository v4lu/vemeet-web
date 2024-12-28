<script lang="ts">
	import { fade, scale } from 'svelte/transition';

	import { buttonVariants } from '../ui/button';
	import { inputVariants } from '../ui/input';
	import { cn } from '$lib/cn';

	type CreateCommentProp = {
		isSubmitting: boolean;
		postComment: (newComment: string) => void;
	};

	let { postComment, isSubmitting }: CreateCommentProp = $props();

	let newComment = $state('');
	let focused = $state(false);

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
		onfocus={() => (focused = true)}
		onblur={() => (focused = false)}
		placeholder="What's on your mind?"
		rows="4"
		class={cn(
			inputVariants({ variant: 'empty' }),
			'mt-1 h-24 w-full resize-none rounded-lg p-3',
			'text-foreground placeholder:text-muted-foreground/50',
			'border-2 border-transparent',
			'transition-all duration-300 ease-in-out',
			'!shadow-none !outline-none',
			'appearance-none',
			focused && 'border-2 border-primary ring-2 ring-primary',
			focused && 'scale-[1.01]'
		)}
		in:fade={{ duration: 200 }}
	></textarea>
	<div class="mt-2 flex w-full justify-end">
		<button
			class={cn(
				buttonVariants({ size: 'sm' }),
				'transition-all duration-200',
				newComment.trim() && 'hover:scale-105'
			)}
			onclick={handleSubmitComment}
			disabled={isSubmitting || !newComment.trim()}
			in:scale={{ duration: 300, start: 0.95 }}
		>
			{isSubmitting ? 'Posting...' : 'Post Comment'}
		</button>
	</div>
</div>
