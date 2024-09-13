<script lang="ts">
	import { useFetchChats } from '$lib/api/use-fetch-chats.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import { sessionStore } from '$lib/stores/session.store.js';
	import type { Chat } from '$lib/types/chat.types';
	import Icon from '@iconify/svelte';

	let { data } = $props();
	const chatsResponse = useFetchChats(data.accessToken);

	function getOtherUser(chat: Chat, currentUserId: number) {
		return chat.user1.id === currentUserId ? chat.user2 : chat.user1;
	}

	function getLastMessage(chat: Chat) {
		return {
			text: 'Last message placeholder',
			timestamp: new Date(chat.updatedAt).toLocaleTimeString(),
			unread: false // You'll need to implement unread status
		};
	}
</script>

<div class="mt-4">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-2xl font-bold">Messages</h1>
		<Button variant="ghost" size="icon">
			<Icon icon="solar:pen-new-square-bold" width="24" height="24" />
		</Button>
	</div>

	{#if chatsResponse.isLoading}
		<div class="space-y-2">
			{#each Array(5) as _}
				<Skeleton class="h-14 w-full" />
			{/each}
		</div>
	{:else if chatsResponse.chats}
		<div class="space-y-2">
			{#each chatsResponse.chats as chat (chat.id)}
				{@const otherUser = getOtherUser(chat, $sessionStore.id)}
				{@const lastMessage = getLastMessage(chat)}
				<a
					href={`/messages/${chat.id}`}
					class="flex cursor-pointer items-center rounded-md p-3 hover:bg-accent"
				>
					<div class="relative mr-4">
						<div class="h-12 w-12 rounded-full">
							<img
								src={otherUser.profileImage?.url || '/placeholder-user.webp'}
								class="rounded-full"
								alt={otherUser.name || otherUser.username}
							/>
						</div>
						<span
							class="absolute bottom-0 right-0 block h-3 w-3 rounded-full border-2 border-white bg-green-400"
						></span>
					</div>
					<div class="flex-1">
						<div class="flex items-center justify-between">
							<h2 class="font-semibold">{otherUser.name || otherUser.username}</h2>
							<span class="text-sm text-muted-foreground">{lastMessage.timestamp}</span>
						</div>
						<p class="truncate text-sm text-muted-foreground">
							{lastMessage.text}
						</p>
					</div>
					{#if lastMessage.unread}
						<div class="ml-2 h-2 w-2 rounded-full bg-blue-500"></div>
					{/if}
				</a>
			{/each}
		</div>
	{/if}
</div>
