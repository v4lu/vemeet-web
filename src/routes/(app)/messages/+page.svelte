<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';

	// Mock data for demonstration
	const conversations = [
		{
			id: 1,
			user: {
				name: 'John Doe',
				avatar: 'https://i.pravatar.cc/150?img=1',
				online: true
			},
			lastMessage: {
				text: "Hey, how's it going?",
				timestamp: '2 min ago',
				unread: true
			}
		},
		{
			id: 2,
			user: {
				name: 'Jane Smith',
				avatar: 'https://i.pravatar.cc/150?img=2',
				online: false
			},
			lastMessage: {
				text: 'Can you send me the document?',
				timestamp: '1 hour ago',
				unread: false
			}
		},
		{
			id: 3,
			user: {
				name: 'Mike Johnson',
				avatar: 'https://i.pravatar.cc/150?img=3',
				online: true
			},
			lastMessage: {
				text: "Let's meet tomorrow at 2 PM",
				timestamp: 'Yesterday',
				unread: true
			}
		}
	];
</script>

<div class="container mx-auto max-w-2xl p-4">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-2xl font-bold">Messages</h1>
		<Button variant="ghost" size="icon">
			<Icon icon="solar:pen-new-square-bold" width="24" height="24" />
		</Button>
	</div>

	<div class="space-y-2">
		{#each conversations as conversation (conversation.id)}
			<div class="flex cursor-pointer items-center rounded-md p-3 hover:bg-accent">
				<div class="relative mr-4">
					<div class="h-12 w-12 rounded-full">
						<img src={conversation.user.avatar} class="rounded-full" alt={conversation.user.name} />
					</div>
					{#if conversation.user.online}
						<span
							class="absolute bottom-0 right-0 block h-3 w-3 rounded-full border-2 border-white bg-green-400"
						></span>
					{/if}
				</div>
				<div class="flex-1">
					<div class="flex items-center justify-between">
						<h2 class="font-semibold">{conversation.user.name}</h2>
						<span class="text-sm text-muted-foreground">{conversation.lastMessage.timestamp}</span>
					</div>
					<p class="truncate text-sm text-muted-foreground">
						{conversation.lastMessage.text}
					</p>
				</div>
				{#if conversation.lastMessage.unread}
					<div class="ml-2 h-2 w-2 rounded-full bg-blue-500"></div>
				{/if}
			</div>
		{/each}
	</div>
</div>
