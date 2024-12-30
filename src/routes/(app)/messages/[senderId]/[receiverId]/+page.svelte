<script lang="ts">
	import Icon from '@iconify/svelte';
	import { onDestroy, onMount, tick } from 'svelte';
	import { Avatar } from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button';
	import { CustomHeader } from '$lib/components/ui/custom-header';
	import { useChat } from '$lib/api/use-chat.svelte.js';
	import { ChatFooter, Message } from '$lib/components/messenger/index.js';
	import type { Message as TMessage } from '$lib/types/chat.types.js';
	import { MessageSkeleton } from '$lib/components/skeleton/index.js';

	let { data } = $props();
	const { resp, fetchData, postMessage, cleanup } = useChat({
		authToken: data.accessToken,
		userId: data.user.id,
		chatId: data.chat?.id,
		firstTime: data.firstTime,
		onNewMessage: () => {
			requestAnimationFrame(scrollToBottom);
		}
	});

	let scrollContainer = $state<HTMLDivElement | null>(null);
	let bottomRef = $state<HTMLDivElement | null>(null);
	let triggerDiv = $state<HTMLDivElement | null>(null);
	let isLoadingMore = $state(false);
	let isInitialLoad = $state(true);
	let observer = $state<IntersectionObserver | null>(null);

	function debounce(fn: Function, ms = 300) {
		let timeoutId: ReturnType<typeof setTimeout>;
		return function (this: any, ...args: any[]) {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => fn.apply(this, args), ms);
		};
	}

	onMount(async () => {
		if (!resp.messages.length) {
			await fetchData(0);
		}
		isInitialLoad = false;
		scrollToBottom();

		observer = new IntersectionObserver(
			debounce(async (entries: IntersectionObserverEntry[]) => {
				const [entry] = entries;
				if (entry.isIntersecting && resp.hasMore && !isLoadingMore) {
					await loadMoreMessages();
				}
			}, 300),
			{
				root: null,
				rootMargin: '100px',
				threshold: 0.1
			}
		);

		if (triggerDiv) {
			observer.observe(triggerDiv);
		}
	});

	onDestroy(() => {
		if (observer) {
			observer.disconnect();
		}
		cleanup();
	});

	function updateMessages(newMessages: TMessage[]) {
		const uniqueMessages = newMessages.filter(
			(newMsg) => !resp.messages.some((existingMsg) => existingMsg.id === newMsg.id)
		);
		if (uniqueMessages.length > 0) {
			resp.messages = [...resp.messages, ...uniqueMessages];
		}
	}

	async function loadMoreMessages() {
		if (!resp.hasMore || isLoadingMore || !scrollContainer) return;

		isLoadingMore = true;

		const scrollPosition = scrollContainer.scrollTop;
		const oldFirstMessage = resp.messages[0];
		await fetchData(resp.currentPage + 1);
		await tick();

		const oldMessageElement = document.getElementById(String(oldFirstMessage.id));
		if (oldMessageElement) {
			oldMessageElement.scrollIntoView();
			scrollContainer.scrollTop = scrollContainer.scrollTop + scrollPosition;
		}

		isLoadingMore = false;
	}

	function scrollToBottom() {
		if (bottomRef) {
			bottomRef.scrollIntoView({ behavior: 'smooth' });
		}
	}
</script>

<div class="container flex h-full flex-col md:border-x md:border-border md:bg-card">
	<CustomHeader class="flex items-center justify-between border-b bg-transparent p-4 shadow-sm">
		<div class="flex items-center pl-6">
			<a href={`/profile/${data.otherUser.id}`}>
				<Avatar user={data.otherUser} class="mr-3 size-10" />
			</a>
			<div>
				<a
					href={`/profile/${data.otherUser.id}`}
					class="duration:200 text-lg font-semibold transition-colors hover:text-primary"
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
	<div
		class="hide-scrollbar scroll-container mb-16 mt-20 flex-1 overflow-y-auto py-4"
		bind:this={scrollContainer}
	>
		<div bind:this={triggerDiv} class="h-4 w-full"></div>

		{#if isLoadingMore}
			<div class="flex justify-center py-2">
				<MessageSkeleton />
			</div>
		{/if}

		{#if isInitialLoad}
			<div class="flex flex-col gap-4">
				<MessageSkeleton />
				<MessageSkeleton />
				<MessageSkeleton />
			</div>
		{:else}
			{#each resp.messages as message (message.id)}
				<Message {message} id={message.id} />
			{/each}
		{/if}

		<div bind:this={bottomRef}></div>
	</div>

	<ChatFooter
		handleSubmit={async (message) => {
			const res = await postMessage(message);
			if (res) {
				updateMessages([res]);
				requestAnimationFrame(scrollToBottom);
			}
		}}
		receipantId={+data.receiverId}
		authToken={data.accessToken}
		isSubmitting={resp.isSubmitting}
	/>
</div>

<style lang="postcss">
	.hide-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
		-webkit-overflow-scrolling: touch;
	}

	.hide-scrollbar::-webkit-scrollbar {
		display: none;
	}

	.scroll-container {
		overscroll-behavior: contain;
		scroll-behavior: smooth;
	}
</style>
