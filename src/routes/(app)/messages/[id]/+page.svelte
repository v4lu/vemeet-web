<script lang="ts">
	import { useFetchChat } from '$lib/api/use-fetch-chat.svelte';
	import { Chat } from '$lib/components/chat';

	let { data } = $props();
	const { resp, fetchData } = useFetchChat(+data.id, data.accessToken);
</script>

<Chat
	authToken={data.accessToken}
	isLoading={resp.isLoading}
	chatId={+data.id}
	messages={resp.messages}
	currentPage={resp.currentPage}
	hasMore={resp.hasMore}
	loadMessages={fetchData}
/>
