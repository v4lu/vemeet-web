<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import Icon from '@iconify/svelte';
	import { Button } from '../ui/button';
	import { inputVariants } from '../ui/input';
	import { cn } from '$lib/cn';

	type Props = {
		handleSubmit: (e: Event) => Promise<void>;
		handleKeyDown: (e: KeyboardEvent) => void;
		newMessage: string;
		isSubmitting: boolean;
	};

	let { handleKeyDown, handleSubmit, isSubmitting, newMessage = $bindable() }: Props = $props();
</script>

<div class="container border-t bg-card p-4 px-6 shadow-lg">
	<form onsubmit={handleSubmit} class="flex items-center gap-4">
		<textarea
			onkeydown={handleKeyDown}
			class={cn(
				inputVariants({ variant: 'empty' }),
				'h-12 max-h-32 min-h-[3rem] resize-none rounded-full px-4 py-2',
				'bg-muted/50 text-foreground placeholder:text-muted-foreground/50',
				'border-2 border-transparent transition-all duration-300 ease-in-out',
				'focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary'
			)}
			placeholder="Type a message..."
			bind:value={newMessage}
		></textarea>
		{#if newMessage.length > 0}
			<div in:fly={{ x: 20, duration: 300 }} out:fade={{ duration: 200 }}>
				<Button disabled={isSubmitting} type="submit" size="icon" class="rounded-full">
					{#if !isSubmitting}
						<Icon icon="solar:plain-bold" class="size-5" />
					{:else}
						<Icon icon="eos-icons:loading" class="size-5 animate-spin" />
					{/if}
				</Button>
			</div>
		{/if}
	</form>
</div>
