<script lang="ts">
	import { useFetchChat } from '$lib/api/use-fetch-chat.svelte';
	import { cn } from '$lib/cn.js';
	import { ChatSkeleton, MessageSkeleton } from '$lib/components/skeleton/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { inputVariants } from '$lib/components/ui/input/index.js';
	import { formatTimestamp } from '$lib/date.js';
	import { sessionStore } from '$lib/stores/session.store.js';
	import type { Message } from '$lib/types/chat.types.js';
	import Icon from '@iconify/svelte';
	import { onDestroy } from 'svelte';

	let { data } = $props();
	const { resp, fetchData, postMessage, cleanup } = useFetchChat(
		$sessionStore.id,
		+data.id,
		data.accessToken
	);

	let newMessage = $state('');

	let chatContainer = $state<HTMLDivElement>();
	let target = $state<HTMLElement | null>(null);
	let isInitialLoad = $state(true);
	let prevMessagesLength = $state(0);
	let shouldAutoScroll = $state(true);
	let otherUser = $derived(
		resp.messages.length > 0
			? resp.messages[0].isSessionUserSender
				? resp.messages[0].recipient
				: resp.messages[0].sender
			: null
	);

	function scrollToBottom(smooth = false) {
		if (chatContainer) {
			chatContainer.scrollTo({
				top: chatContainer.scrollHeight,
				behavior: smooth ? 'smooth' : 'auto'
			});
		}
	}

	function isNearBottom() {
		if (!chatContainer) return false;
		const threshold = 100; // pixels from bottom
		const position =
			chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight;
		return position < threshold;
	}

	function updateMessages(newMessages: Message[]) {
		const uniqueMessages = newMessages.filter(
			(newMsg) => !resp.messages.some((existingMsg) => existingMsg.id === newMsg.id)
		);
		if (uniqueMessages.length > 0) {
			shouldAutoScroll = isNearBottom();
			resp.messages = [...resp.messages, ...uniqueMessages].sort(
				(a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
			);
			if (shouldAutoScroll) {
				setTimeout(() => scrollToBottom(true), 0);
			}
		}
	}

	async function handleSubmit(event: Event) {
		event.preventDefault();
		if (newMessage.trim().length > 0 && otherUser) {
			const messageData = {
				recipientId: otherUser.id,
				messageType: 'text',
				content: newMessage,
				isOneTime: false
			};

			const res = await postMessage(messageData);
			if (res) {
				shouldAutoScroll = true;
				updateMessages([res]);
				newMessage = '';
			}
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			handleSubmit(event);
		}
	}

	$effect(() => {
		if (!chatContainer) return;
		if (isInitialLoad && resp.messages.length > 0) {
			scrollToBottom();
			isInitialLoad = false;
		} else if (!isInitialLoad && resp.messages.length > prevMessagesLength) {
			if (shouldAutoScroll) {
				scrollToBottom(true);
			} else {
				const scrollPosition = chatContainer.scrollHeight - chatContainer.scrollTop;
				setTimeout(() => {
					if (chatContainer) {
						chatContainer.scrollTop = chatContainer.scrollHeight - scrollPosition;
					}
				}, 0);
			}
		}
		prevMessagesLength = resp.messages.length;
	});

	$effect(() => {
		const handleScroll = () => {
			if (chatContainer && target && !resp.isLoading && resp.hasMore) {
				const rect = target.getBoundingClientRect();
				const containerRect = chatContainer.getBoundingClientRect();
				const isInViewport = rect.bottom >= containerRect.top;

				if (isInViewport) {
					fetchData(resp.currentPage + 1);
				}
			}
		};

		chatContainer?.addEventListener('scroll', handleScroll);
		if (resp.currentPage === 0 && resp.messages.length === 0) {
			fetchData(0);
		}
		return () => {
			chatContainer?.removeEventListener('scroll', handleScroll);
		};
	});

	onDestroy(() => {
		cleanup();
	});
</script>

{#if resp.isLoading && resp.messages.length === 0}
	<ChatSkeleton />
{:else}
	<div class="flex h-[calc(100vh-64px-65px)] flex-col pt-2.5">
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
			<div bind:this={target} class="h-1 w-full"></div>
			{#if resp.isLoading}
				<MessageSkeleton />
			{/if}
			{#if resp.messages && resp.messages.length > 0}
				{#each resp.messages as message (message.id)}
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
				<Button type="submit" size="icon">
					<Icon icon="mynaui:send" class="size-4" />
				</Button>
			</form>
		</div>
	</div>
{/if}

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
