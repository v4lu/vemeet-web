<script lang="ts">
	import { useFetchChats } from '$lib/api/use-fetch-chats.svelte';
	import { CustomHeaderWithTitle } from '$lib/components/ui/custom-header';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import { formatTimestamp } from '$lib/date.js';
	import { sessionStore } from '$lib/stores/session.store';
	import type { Chat } from '$lib/types/chat.types';
	import Icon from '@iconify/svelte';

	let { data } = $props();
	const { resp } = useFetchChats(data.accessToken);

	function getLastMessagePreview(chat: Chat): string {
		if (!chat.lastMessage) return 'No messages yet';
		if (chat.lastMessage.messageType === 'AUDIO') return 'Voice message';
		if (chat.lastMessage.messageType === 'IMAGE') return 'Image';
		return chat.lastMessage.content || `[${chat.lastMessage.messageType}]`;
	}

	function getMessageIcon(messageType: string) {
		switch (messageType) {
			case 'AUDIO':
				return 'solar:microphone-bold';
			case 'IMAGE':
				return 'solar:gallery-wide-bold';
			default:
				return 'solar:chat-round-dots-bold';
		}
	}
</script>

<CustomHeaderWithTitle title="Messages" />

<div
	class="container min-h-full bg-background py-4 sm:px-6 lg:border-x lg:border-border lg:bg-card"
>
	<div class="mx-auto space-y-6">
		<div class="space-y-2">
			<h2 class="text-xl font-semibold tracking-tight sm:text-2xl">Recent Chats</h2>
			<p class="text-sm text-muted-foreground">Keep in touch with your connections</p>
		</div>

		{#if resp.isLoading}
			<div class="space-y-4 rounded-lg border bg-card p-4 shadow-sm">
				{#each Array(5) as _}
					<div class="flex items-center space-x-4">
						<Skeleton class="size-12 rounded-full" />
						<div class="flex-1 space-y-2">
							<div class="flex justify-between">
								<Skeleton class="h-4 w-1/4" />
								<Skeleton class="h-4 w-1/6" />
							</div>
							<Skeleton class="h-3 w-2/3" />
						</div>
					</div>
				{/each}
			</div>
		{:else if resp.chats && resp.chats.length > 0}
			<div class="space-y-1 rounded-lg border bg-card shadow-sm">
				{#each resp.chats as chat (chat.id)}
					<a
						href={`/messages/${$sessionStore.id}/${chat.otherUser.id}`}
						class="relative flex items-center space-x-4 p-4 transition-colors hover:bg-accent/50"
					>
						<div class="relative">
							<img
								src={chat.otherUser.profileImage?.url || '/placeholder-user.webp'}
								class="size-12 rounded-full border-2 border-background object-cover shadow-sm"
								alt={chat.otherUser.name || chat.otherUser.username}
							/>
							{#if !chat.sessionUserSeenStatus}
								<div
									class="absolute bottom-0 right-0 size-3 rounded-full border-2 border-background bg-primary"
								></div>
							{/if}
						</div>
						<div class="min-w-0 flex-1">
							<div class="flex items-center justify-between">
								<h3 class="truncate font-medium">
									{chat.otherUser.name || chat.otherUser.username}
								</h3>
								<span class="shrink-0 text-xs text-muted-foreground">
									{chat.lastMessage
										? formatTimestamp(chat.lastMessage.createdAt)
										: formatTimestamp(chat.updatedAt)}
								</span>
							</div>
							<div class="mt-1 flex items-center space-x-2">
								{#if chat.lastMessage}
									<Icon
										icon={getMessageIcon(chat.lastMessage.messageType)}
										class="size-4 shrink-0 text-muted-foreground"
									/>
								{/if}
								<p class="truncate text-sm text-muted-foreground">
									{getLastMessagePreview(chat)}
								</p>
							</div>
						</div>
						<Icon icon="solar:arrow-right-bold" class="size-5 shrink-0 text-muted-foreground" />
					</a>
					{#if chat !== resp.chats[resp.chats.length - 1]}
						<div class="border-t border-border/50"></div>
					{/if}
				{/each}
			</div>
		{:else}
			<div
				class="flex flex-col items-center justify-center rounded-lg border bg-card p-8 text-center shadow-sm"
			>
				<div class="flex size-16 items-center justify-center rounded-full bg-primary/10">
					<Icon icon="solar:chat-round-dots-bold" class="size-8 text-primary" />
				</div>
				<h3 class="mt-4 text-lg font-medium">No Messages Yet</h3>
				<p class="mt-2 text-sm text-muted-foreground">
					Start a conversation with your matches to chat
				</p>
			</div>
		{/if}

		<div class="rounded-lg border bg-card/50 p-4">
			<div class="flex items-start space-x-2">
				<Icon icon="solar:info-circle-bold" class="mt-1 size-5 text-muted-foreground" />
				<div class="flex-1 text-sm text-muted-foreground">
					<p>
						Messages are listed from most recent to oldest. Unread messages are marked with a blue
						dot.
					</p>
				</div>
			</div>
		</div>
	</div>
</div>
