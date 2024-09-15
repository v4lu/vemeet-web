<script lang="ts">
	import { useFetchChat } from '$lib/api/use-fetch-chat.svelte';
	import { Chat } from '$lib/components/chat';
	import { ChatSkeleton } from '$lib/components/skeleton';

	let { data } = $props();
	const { resp } = useFetchChat(+data.id, data.accessToken);
</script>

{#if resp.isLoading}
	<ChatSkeleton />
{:else if resp.messages}
	<Chat authToken={data.accessToken} chatId={+data.id} messages={resp.messages} />
{/if}
