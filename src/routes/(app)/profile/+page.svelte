<script lang="ts">
	import {
		ProfileMedia,
		ProfileSessionHeader,
		ProfileSessionPosts,
		ProfileSessionRecipes
	} from '$lib/components/profile';
	import { sessionStore } from '$lib/stores/session.store.js';
	import { quintOut } from 'svelte/easing';
	import { spring } from 'svelte/motion';
	import { fade } from 'svelte/transition';

	let { data } = $props();

	let activeTab = $state('Posts');
	const tabs = $state(['Posts', 'Recipes', 'Media']);

	function setActiveTab(tab: string) {
		activeTab = tab;
	}

	const indicatorSpring = spring(
		{ x: 0, w: 0 },
		{
			stiffness: 0.2,
			damping: 0.4
		}
	);

	let tabWidth: number;
	let tabLeft: number;

	$effect(() => {
		tabWidth = 100 / tabs.length;
		tabLeft = tabs.indexOf(activeTab) * tabWidth;
		indicatorSpring.set({ x: tabLeft, w: tabWidth });
	});
</script>

<div class="mb-12">
	<div class=" overflow-hidden bg-card shadow-lg">
		<ProfileSessionHeader authToken={data.accessToken} />
		<nav class="relative flex border-t border-border">
			{#each tabs as tab}
				<button
					class="flex-1 px-6 py-4 text-sm font-bold transition-colors hover:bg-muted/50"
					class:text-primary={activeTab === tab}
					class:text-muted-foreground={activeTab !== tab}
					onclick={() => setActiveTab(tab)}
				>
					{tab}
				</button>
			{/each}
			<div
				class="absolute bottom-0 h-0.5 bg-primary transition-all duration-300 ease-out"
				style="left: {$indicatorSpring.x}%; width: {$indicatorSpring.w}%;"
			></div>
		</nav>
	</div>

	<div class="container mt-4">
		{#if activeTab === 'Posts'}
			<div in:fade={{ duration: 300, easing: quintOut }}>
				<ProfileSessionPosts authToken={data.accessToken} />
			</div>
		{:else if activeTab === 'Recipes'}
			<div in:fade={{ duration: 300, easing: quintOut }}>
				<ProfileSessionRecipes authToken={data.accessToken} />
			</div>
		{:else if activeTab === 'Media'}
			<div in:fade={{ duration: 300, easing: quintOut }}>
				<ProfileMedia userId={$sessionStore.id} authToken={data.accessToken} />
			</div>
		{/if}
	</div>
</div>
