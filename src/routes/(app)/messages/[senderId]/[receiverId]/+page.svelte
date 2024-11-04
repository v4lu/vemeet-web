<script lang="ts">
	import { useChat } from '$lib/api/use-chat.svelte.js';
	import { ChatFooter, Message } from '$lib/components/messenger/index.js';
	import { MessageSkeleton } from '$lib/components/skeleton';
	import { Avatar } from '$lib/components/ui/avatar/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import CustomHeader from '$lib/components/ui/custom-header/custom-header.svelte';
	import type { Message as TMessage } from '$lib/types/chat.types.js';
	import Icon from '@iconify/svelte';
	import { onDestroy, onMount } from 'svelte';

	let { data } = $props();
	const { resp, fetchData, postMessage, cleanup } = useChat({
		authToken: data.accessToken,
		userId: data.user.id,
		chatId: data.chat?.id,
		firstTime: data.firstTime
	});

	let isSubmittingMessage = $state(false);
	let scrollContainer: HTMLDivElement;
	let messageList: HTMLDivElement;
	let isLoadingMore = $state(false);
	let isInitialLoad = $state(true);
	let isNearBottom = $state(true);
	let lastScrollTop = $state(0);

	// Initial data load
	onMount(async () => {
		try {
			if (!resp.messages.length) {
				await fetchData(1);
			}
		} finally {
			isInitialLoad = false;
		}

		if (scrollContainer) {
			scrollContainer.addEventListener('scroll', handleScroll);
			scrollToBottom();
		}
	});

	function updateMessages(newMessages: TMessage[]) {
		const uniqueMessages = newMessages.filter(
			(newMsg) => !resp.messages.some((existingMsg) => existingMsg.id === newMsg.id)
		);
		if (uniqueMessages.length > 0) {
			resp.messages = [...resp.messages, ...uniqueMessages];
			if (isNearBottom) {
				requestAnimationFrame(scrollToBottom);
			}
		}
	}

	function scrollToBottom() {
		if (scrollContainer) {
			const { scrollHeight, clientHeight } = scrollContainer;
			scrollContainer.scrollTop = scrollHeight - clientHeight;
		}
	}

	async function loadMoreMessages() {
		if (!resp.hasMore || isLoadingMore) return;

		isLoadingMore = true;
		const previousScrollHeight = scrollContainer?.scrollHeight || 0;
		const previousScrollTop = scrollContainer?.scrollTop || 0;

		try {
			await fetchData(resp.currentPage + 1);

			// Wait for DOM update
			await new Promise((resolve) => setTimeout(resolve, 50));

			if (scrollContainer) {
				const newScrollHeight = scrollContainer.scrollHeight;
				const heightDifference = newScrollHeight - previousScrollHeight;
				scrollContainer.scrollTop = previousScrollTop + heightDifference;
			}
		} catch (error) {
			console.error('Error loading more messages:', error);
		} finally {
			isLoadingMore = false;
		}
	}

	function handleScroll() {
		if (!scrollContainer || isLoadingMore) return;

		const { scrollTop, scrollHeight, clientHeight } = scrollContainer;

		// Check if scrolling up and near top
		if (scrollTop < lastScrollTop && scrollTop < 100 && resp.hasMore) {
			loadMoreMessages();
		}

		// Update bottom proximity state
		isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
		lastScrollTop = scrollTop;
	}

	$effect(() => {
		if (resp.messages.length > 0 && !isLoadingMore) {
			const lastMessage = resp.messages[resp.messages.length - 1];
			if (lastMessage.sender.id !== data.user.id && isNearBottom) {
				requestAnimationFrame(scrollToBottom);
			}
		}
	});

	onDestroy(() => {
		cleanup();
		if (scrollContainer) {
			scrollContainer.removeEventListener('scroll', handleScroll);
		}
	});
</script>

<CustomHeader class="flex items-center justify-between border-b bg-transparent p-4 shadow-sm">
	<div class="flex items-center pl-6">
		<a href={`/profile/${data.otherUser.id}`}>
			<Avatar user={data.otherUser} class="mr-3 size-10" />
		</a>
		<div>
			<a
				href={`/profile/${data.otherUser.id}`}
				class="text-lg font-semibold transition-colors duration-200 hover:text-primary"
			>
				{data.otherUser.username}
			</a>
			<p class="text-xs text-muted-foreground">
				{true ? 'Online' : 'Offline'}
			</p>
		</div>
	</div>
	<Button variant="ghost" size="icon" class="rounded-full">
		<Icon icon="solar:menu-dots-bold" class="size-5" />
	</Button>
</CustomHeader>

<div class="grid flex-1 bg-background">
	<div class="h-[calc(100dvh-81px)] overflow-hidden">
		<div
			bind:this={scrollContainer}
			class="hide-scrollbar container h-full overflow-y-auto lg:border-x lg:border-border lg:bg-card"
		>
			<div bind:this={messageList} class="mt-20 flex min-h-full flex-col justify-start">
				<div class="mt-auto">
					{#if isLoadingMore}
						<MessageSkeleton />
					{/if}

					{#if isInitialLoad}
						<MessageSkeleton />
					{:else if resp.messages.length === 0}
						<div class="flex h-full items-center justify-center">
							<p class="text-muted-foreground">No messages yet. Start a conversation!</p>
						</div>
					{:else}
						{#each resp.messages as message}
							<Message {message} />
						{/each}
					{/if}
				</div>
			</div>
		</div>
	</div>
	<ChatFooter
		handleSubmit={async (message) => {
			isSubmittingMessage = true;
			const res = await postMessage(message);
			if (res) {
				updateMessages([res]);
				requestAnimationFrame(scrollToBottom);
			}
			isSubmittingMessage = false;
		}}
		receipantId={+data.receiverId}
		authToken={data.accessToken}
		isSubmitting={isSubmittingMessage}
	/>
</div>

<style lang="postcss">
	.hide-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}

	.hide-scrollbar::-webkit-scrollbar {
		display: none;
	}
</style>
