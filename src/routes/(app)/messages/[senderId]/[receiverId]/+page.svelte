<script lang="ts">
	import { useChat } from '$lib/api/use-chat.svelte.js';
	import { ChatFooter, Message } from '$lib/components/messenger/index.js';
	import { MessageSkeleton } from '$lib/components/skeleton';
	import { Avatar } from '$lib/components/ui/avatar/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import CustomHeader from '$lib/components/ui/custom-header/custom-header.svelte';
	import type { Message as TMessage } from '$lib/types/chat.types.js';
	import Icon from '@iconify/svelte';
	import { onDestroy } from 'svelte';

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
	let shouldPreserveScroll = $state(false);
	let lastScrollTop = $state(0);

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
			scrollContainer.scrollTop = scrollContainer.scrollHeight;
		}
	}

	async function loadMoreMessages() {
		if (!resp.hasMore || isLoadingMore) return;

		isLoadingMore = true;
		shouldPreserveScroll = true;

		try {
			const oldFirstMessage = messageList?.firstElementChild;
			const oldHeight = scrollContainer?.scrollHeight || 0;

			await fetchData(resp.currentPage + 1);

			// Wait for DOM update
			await new Promise((resolve) => setTimeout(resolve, 0));

			if (scrollContainer && oldFirstMessage) {
				const newHeight = scrollContainer.scrollHeight;
				const heightDiff = newHeight - oldHeight;
				scrollContainer.scrollTop = heightDiff;
			}
		} catch (error) {
			console.error('Error loading more messages:', error);
		} finally {
			isLoadingMore = false;
			shouldPreserveScroll = false;
		}
	}

	function handleScroll() {
		if (!scrollContainer || shouldPreserveScroll || isLoadingMore) return;

		const { scrollTop } = scrollContainer;
		const scrollingUp = scrollTop < lastScrollTop;
		lastScrollTop = scrollTop;

		// Check if we're at or very close to the top and scrolling up
		if (scrollTop <= 10 && scrollingUp && resp.hasMore) {
			loadMoreMessages();
		}

		// Update near bottom state
		const { scrollHeight, clientHeight } = scrollContainer;
		isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
	}

	$effect(() => {
		if (!resp.firstTime) {
			fetchData(0).then(() => {
				isInitialLoad = false;
				requestAnimationFrame(scrollToBottom);
			});
		}

		if (scrollContainer) {
			// Store initial scroll position
			lastScrollTop = scrollContainer.scrollTop;
			scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
		}
	});

	$effect(() => {
		if (resp.messages.length > 0 && !isLoadingMore && !shouldPreserveScroll) {
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
					{#if !resp.firstTime && (isInitialLoad || resp.isLoading) && resp.messages.length === 0}
						<MessageSkeleton />
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
