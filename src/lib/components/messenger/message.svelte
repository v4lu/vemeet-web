<script lang="ts">
	import { cn } from '$lib/cn';
	import { formatTimestamp } from '$lib/date';
	import { sessionStore } from '$lib/stores/session.store';
	import type { Message } from '$lib/types/chat.types';
	import { fly } from 'svelte/transition';
	type Props = {
		message: Message;
	};

	let { message }: Props = $props();
</script>

<div
	class={cn('mb-4 flex', message.sender.id === $sessionStore.id ? 'justify-end' : 'justify-start')}
	in:fly={{ y: message.sender.id === $sessionStore.id ? 50 : -50, duration: 300 }}
	out:fly={{ y: message.sender.id === $sessionStore.id ? 50 : -50, duration: 300 }}
>
	<div
		class={cn(
			'flex max-w-[70%] flex-col',
			message.sender.id === $sessionStore.id ? 'items-end' : 'items-start'
		)}
	>
		<div
			class={cn(
				'rounded-2xl p-3 shadow-md transition-all duration-200 hover:shadow-lg',
				message.sender.id === $sessionStore.id
					? 'bg-primary text-primary-foreground'
					: 'bg-accent text-accent-foreground'
			)}
		>
			<p class="break-words">{message.content}</p>
		</div>
		<span class="mt-1 text-xs text-muted-foreground">
			{formatTimestamp(message.createdAt)}
		</span>
	</div>
</div>
