<script lang="ts">
	import { useFetchChat } from '$lib/api/use-fetch-chat.svelte';
	import { Chat } from '$lib/components/chat';
	import { ChatSkeleton } from '$lib/components/skeleton';

	let { data } = $props();
	const chatResponse = useFetchChat(+data.id, data.accessToken);
</script>

{#if chatResponse.isLoading}
	<ChatSkeleton />
{:else if chatResponse.messages}
	<Chat authToken={data.accessToken} chatId={+data.id} messages={chatResponse.messages} />
{/if}
