<script lang="ts">
	import { usePostMessage } from '$lib/api/use-create-message.svelte';
	import { cn } from '$lib/cn';
	import { Button } from '$lib/components/ui/button';
	import { inputVariants } from '$lib/components/ui/input';
	import { formatTimestamp } from '$lib/date';
	import { webSocketService } from '$lib/service/chat-websocket.service';
	import { sessionStore } from '$lib/stores/session.store';
	import type { Message } from '$lib/types/chat.types';
	import { type User } from '$lib/types/user.types';
	import Icon from '@iconify/svelte';
	import { onDestroy, onMount } from 'svelte';

	type ChatProps = {
		messages: Message[];
		authToken: string;
		chatId: number;
	};

	let { messages, chatId, authToken }: ChatProps = $props();
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

	function updateMessages(newMessages: Message[]) {
		const uniqueMessages = newMessages.filter(
			(newMsg) => !messages.some((existingMsg) => existingMsg.id === newMsg.id)
		);
		if (uniqueMessages.length > 0) {
			messages = [...messages, ...uniqueMessages];
			setTimeout(scrollToBottom, 0);
		}
	}

	onMount(() => {
		scrollToBottom();
		webSocketService.connect($sessionStore.id, authToken);
		const unsubscribe = webSocketService.subscribe((newMessages) => {
			updateMessages(newMessages);
		});
		return unsubscribe;
	});

	onDestroy(() => {
		webSocketService.disconnect();
	});

	async function handleSubmit(event: Event) {
		event.preventDefault();
		if (newMessage.trim().length > 0 && !isLoading && otherUser) {
			const messageData = {
				recipientId: otherUser.id,
				messageType: 'text',
				content: newMessage,
				isOneTime: false
			};

			const res = await postMessage(messageData);
			if (res) {
				updateMessages([res]);
				webSocketService.sendMessage(res);
				newMessage = '';
			}
			setTimeout(scrollToBottom, 0);
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			handleSubmit(event);
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

	<div bind:this={chatContainer} class="hide-scrollbar flex-1 overflow-y-auto p-4">
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
				onkeydown={handleKeyDown}
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

<style>
	/* Hide scrollbar for Chrome, Safari and Opera */
	.hide-scrollbar::-webkit-scrollbar {
		display: none;
	}

	/* Hide scrollbar for IE, Edge and Firefox */
	.hide-scrollbar {
		-ms-overflow-style: none; /* IE and Edge */
		scrollbar-width: none; /* Firefox */
	}
</style>
