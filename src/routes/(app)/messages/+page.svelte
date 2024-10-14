<script lang="ts">
	import { useFetchChats } from '$lib/api/use-fetch-chats.svelte';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import { formatTimestamp } from '$lib/date.js';
	import type { Chat } from '$lib/types/chat.types';
	import { sessionStore } from '$lib/stores/session.store';
	import { CustomHeaderWithTitle } from '$lib/components/ui/custom-header';

	let { data } = $props();
	const { resp } = useFetchChats(data.accessToken);

	function getLastMessagePreview(chat: Chat): string {
		if (!chat.lastMessage) return 'No messages yet';
		return chat.lastMessage.content || `[${chat.lastMessage.messageType}]`;
	}
</script>

<CustomHeaderWithTitle title="Mesages" />

<main class="mb-8 mt-4">
	{#if resp.isLoading}
		<div class="space-y-2">
			{#each Array(5) as _}
				<Skeleton class="h-14 w-full" />
			{/each}
		</div>
	{:else if resp.chats}
		<div class="space-y-2">
			{#each resp.chats as chat (chat.id)}
				<a
					href={`/messages/${$sessionStore.id}/${chat.otherUser.id}`}
					class="flex cursor-pointer items-center rounded-md p-3 hover:bg-accent"
				>
					<div class="relative mr-4">
						<img
							src={chat.otherUser.profileImage?.url || '/placeholder-user.webp'}
							class="size-12 rounded-full bg-cover bg-center object-cover object-center"
							alt={chat.otherUser.name || chat.otherUser.username}
						/>
					</div>
					<div class="flex-1">
						<div class="flex items-center justify-between">
							<h2 class="font-semibold">{chat.otherUser.name || chat.otherUser.username}</h2>
							<span class="text-sm text-muted-foreground">
								{chat.lastMessage
									? formatTimestamp(chat.lastMessage.createdAt)
									: formatTimestamp(chat.updatedAt)}
							</span>
						</div>
						<p class="truncate text-sm text-muted-foreground">
							{getLastMessagePreview(chat)}
						</p>
					</div>
					{#if !chat.sessionUserSeenStatus}
						<div class="ml-2 h-2 w-2 rounded-full bg-blue-500"></div>
					{/if}
				</a>
			{/each}
		</div>
	{:else}
		<p>No chats found.</p>
	{/if}
</main>
