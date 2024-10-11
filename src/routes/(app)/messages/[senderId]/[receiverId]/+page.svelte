<script lang="ts">
	import { useFetchChat } from '$lib/api/use-fetch-chat.svelte';
	import { ChatFooter, Message } from '$lib/components/messenger/index.js';
	import { MessageSkeleton } from '$lib/components/skeleton';
	import { Avatar } from '$lib/components/ui/avatar/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import type { Message as TMessage } from '$lib/types/chat.types.js';
	import { debounce } from '$lib/utils.js';
	import Icon from '@iconify/svelte';
	import { onDestroy } from 'svelte';

	let { data } = $props();
	const { resp, fetchData, postMessage, cleanup } = useFetchChat({
		authToken: data.accessToken,
		userId: data.user.id,
		chatId: data.chat?.id,
		firstTime: data.firstTime
	});

	let newMessage = $state('');
	let isSubmittingMessage = $state(false);
	let scrollContainer: HTMLDivElement;
	let messageList: HTMLDivElement;
	let isLoadingMore = $state(false);
	let isInitialLoad = $state(true);
	let prevScrollHeight = $state(0);
	let isNearBottom = $state(true);

	function updateMessages(newMessages: TMessage[]) {
		const uniqueMessages = newMessages.filter(
			(newMsg) => !resp.messages.some((existingMsg) => existingMsg.id === newMsg.id)
		);
		if (uniqueMessages.length > 0) {
			resp.messages = [...resp.messages, ...uniqueMessages].sort(
				(a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
			);
			if (isNearBottom) {
				setTimeout(scrollToBottom, 0);
			}
		}
	}

	async function handleSubmit(event: Event) {
		event.preventDefault();
		if (newMessage.trim().length > 0) {
			isSubmittingMessage = true;
			const messageData = {
				recipientId: data.otherUser.id,
				messageType: 'text',
				content: newMessage,
				isOneTime: false
			};

			const res = await postMessage(messageData);
			if (res) {
				updateMessages([res]);
				newMessage = '';
				setTimeout(scrollToBottom, 0);
			}
			isSubmittingMessage = false;
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			handleSubmit(event);
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
		prevScrollHeight = scrollContainer.scrollHeight;
		await fetchData(resp.currentPage + 1);
		isLoadingMore = false;
		scrollContainer.scrollTop = scrollContainer.scrollHeight - prevScrollHeight;
	}

	const debouncedLoadMoreMessages = debounce(() => {
		loadMoreMessages();
	}, 200);

	function handleScroll() {
		if (scrollContainer) {
			const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
			isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

			if (scrollTop === 0 && !isLoadingMore && resp.hasMore) {
				debouncedLoadMoreMessages();
			}
		}
	}

	$effect(() => {
		if (!resp.firstTime) {
			fetchData(0).then(() => {
				isInitialLoad = false;
				setTimeout(scrollToBottom, 0);
			});
		}
		if (scrollContainer) {
			scrollContainer.addEventListener('scroll', handleScroll);
		}
	});

	$effect(() => {
		if (resp.messages.length > 0 && !isLoadingMore) {
			const lastMessage = resp.messages[resp.messages.length - 1];
			if (lastMessage.sender.id !== data.user.id && isNearBottom) {
				setTimeout(scrollToBottom, 0);
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

<div class="grid flex-1 bg-background">
	<div class="container flex items-center justify-between border-b p-4 px-6 shadow-sm lg:bg-card">
		<div class="flex items-center">
			<a href={`/profile/${data.otherUser.id}`}>
				<Avatar user={data.otherUser} class="mr-3 size-12" />
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
	</div>

	<div class="h-[calc(100dvh-64px-81px-65px-70px)] overflow-hidden">
		<div
			bind:this={scrollContainer}
			class="hide-scrollbar container h-full overflow-y-auto lg:border-x lg:border-border lg:bg-card"
		>
			<div bind:this={messageList} class="flex min-h-full flex-col justify-end">
				<div class="mt-auto pt-4">
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
	<ChatFooter {handleSubmit} {handleKeyDown} bind:newMessage isSubmitting={isSubmittingMessage} />
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
