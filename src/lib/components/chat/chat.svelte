<script lang="ts">
	import { usePostMessage } from '$lib/api/use-create-message.svelte';
	import { cn } from '$lib/cn';
	import { Button } from '$lib/components/ui/button';
	import { inputVariants } from '$lib/components/ui/input';
	import { formatTimestamp } from '$lib/date';
	import { sessionStore } from '$lib/stores/session.store';
	import type { Message } from '$lib/types/chat.types';
	import { type User } from '$lib/types/user.types';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';

	type ChatProps = {
		messages: Message[];
		authToken: string;
		chatId: number;
		onSendMessage: (message: Message) => void;
	};

	let { messages, chatId, authToken, onSendMessage }: ChatProps = $props();
	let newMessage = $state('');
	let otherUser = $state<User | null>(null);
	let chatContainer = $state<HTMLDivElement>();
	const { postMessage, isLoading } = usePostMessage(chatId, authToken);

	$effect(() => {
		if (messages && messages.length > 0) {
			const uniqueUsers = new Set(messages.map((m) => m.sender.id));
			if (uniqueUsers.size === 2) {
				const otherUserId = Array.from(uniqueUsers).find((id) => id !== $sessionStore.id);
				otherUser = messages.find((m) => m.sender.id === otherUserId)?.sender || null;
			} else if (uniqueUsers.size === 1 && !uniqueUsers.has($sessionStore.id)) {
				otherUser = messages[0].sender;
			}
		}
	});

	function scrollToBottom() {
		if (chatContainer) {
			chatContainer.scrollTop = chatContainer.scrollHeight;
		}
	}

	onMount(() => {
		scrollToBottom();
	});

	async function handleSubmit(event: Event) {
		event.preventDefault();
		if (newMessage.trim().length > 0 && !isLoading && otherUser) {
			const res = await postMessage({
				recipientId: otherUser.id,
				messageType: 'text',
				content: newMessage,
				isOneTime: false
			});
			if (res) {
				onSendMessage(res);
				newMessage = '';
				setTimeout(scrollToBottom, 0);
			}
		}
	}
</script>

<div class="flex h-[calc(100vh-78px)] flex-col">
	<div class="flex items-center justify-between border-b p-4">
		<div class="flex items-center">
			<img
				src={otherUser?.profileImage?.url || '/placeholder-user.webp'}
				alt={otherUser?.name || otherUser?.username}
				class="mr-3 h-10 w-10 rounded-full object-cover"
			/>
			<h2 class="text-lg font-semibold">{otherUser?.name || otherUser?.username}</h2>
		</div>
		<Button variant="ghost" size="icon">
			<Icon icon="solar:menu-dots-bold" width="24" height="24" />
		</Button>
	</div>

	<div bind:this={chatContainer} class="flex-1 overflow-y-auto p-4">
		{#if messages && messages.length > 0}
			{#each messages as message (message.id)}
				<div
					class={cn(
						'mb-4 flex',
						message.sender.id === $sessionStore.id ? 'justify-end' : 'justify-start'
					)}
				>
					<div
						class={cn(
							'flex flex-col',
							message.sender.id === $sessionStore.id ? 'items-end' : 'items-start'
						)}
					>
						<div
							class={cn(
								' rounded-lg p-3',
								message.sender.id === $sessionStore.id
									? 'bg-primary text-primary-foreground'
									: 'bg-accent'
							)}
						>
							<p>{message.content}</p>
						</div>
						<span class="mt-1 text-xs opacity-70">
							{formatTimestamp(message.createdAt)}
						</span>
					</div>
				</div>
			{/each}
		{:else}
			<p class="text-center text-muted-foreground">No messages yet. Start the conversation!</p>
		{/if}
	</div>

	<div class="border-t p-4">
		<form onsubmit={handleSubmit} class="flex items-center gap-4">
			<textarea
				class={cn(inputVariants(), 'resize-none')}
				placeholder="Type a message..."
				bind:value={newMessage}
			></textarea>
			<Button type="submit" size="icon" disabled={isLoading}>
				<Icon icon="mynaui:send" class="size-4" />
			</Button>
		</form>
	</div>
</div>
