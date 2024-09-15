<script lang="ts">
	import { useUser } from '$lib/api/use-user-by-id.svelte.js';
	import { ProfileFeed, ProfileHeader, ProfileMedia } from '$lib/components/profile';
	import { ProfileHeaderSkeleton } from '$lib/components/skeleton';
	import { quintOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';

	let { data } = $props();

	let activeTab = $state('Posts');
	const tabs = $state(['Posts', 'Recipes', 'Media']);

	function setActiveTab(tab: string) {
		activeTab = tab;
	}

	const { resp } = useUser(data.accessToken, data.id);
</script>

<div class="mt-4">
	{#if resp.isLoading}
		<ProfileHeaderSkeleton />
	{:else if resp.user}
		<ProfileHeader followers={resp.followers} following={resp.following} user={resp.user} />
	{/if}
</div>
<nav class="relative my-2 flex">
	{#each tabs as tab}
		<button
			class="flex-1 px-6 py-3 text-sm font-medium transition-colors"
			class:text-primary={activeTab === tab}
			class:text-muted-foreground={activeTab !== tab}
			onclick={() => setActiveTab(tab)}
		>
			{tab}
		</button>
	{/each}
	<div
		class="absolute bottom-0 h-0.5 bg-primary transition-all duration-300 ease-out"
		style="left: {(tabs.indexOf(activeTab) * 100) / tabs.length}%; width: {100 / tabs.length}%;"
	></div>
</nav>

<div class="mt-4">
	{#if activeTab === 'Posts'}
		<div in:fade={{ duration: 300, easing: quintOut }}>
			<ProfileFeed authToken={data.accessToken} userId={data.id} />
		</div>
	{:else if activeTab === 'Recipes'}
		<div in:fade={{ duration: 300, easing: quintOut }}>
			<h2>Recipes area</h2>
		</div>
	{:else if activeTab === 'Media'}
		<div in:fade={{ duration: 300, easing: quintOut }}>
			<ProfileMedia authToken={data.accessToken} userId={data.id} />
		</div>
	{/if}
</div>
