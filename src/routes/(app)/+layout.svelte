<script lang="ts">
	import { cn } from '$lib/cn';
	import { Header, Island } from '$lib/components/layout';
	import { showHeader, showIsland } from '$lib/constants';
	import { sessionStore } from '$lib/stores/session.store.js';

	let { children, data } = $props();
	sessionStore.setUser(data.user);
</script>

<div
	class="flex min-h-dvh flex-1 flex-col bg-gradient-to-r from-primary/10 via-primary/5 to-transparent"
>
	{#if showHeader(data.path)}
		<Header authToken={data.accessToken} />
	{/if}
	<main class={cn('flex-1', showIsland(data.path) && 'mb-10 mt-14 pb-4')}>
		{@render children()}
	</main>

	{#if showIsland(data.path)}
		<Island pathname={data.path} />
	{/if}
</div>
