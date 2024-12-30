<script lang="ts">
	import { quintOut } from 'svelte/easing';
	import { spring } from 'svelte/motion';
	import { fade } from 'svelte/transition';
	import { useUser } from '$lib/api/use-user-by-id.svelte.js';
	import { ProfileFeed, ProfileHeader, ProfileMedia, RecipeFeed } from '$lib/components/profile';
	import { ProfileHeaderSkeleton } from '$lib/components/skeleton';
	import { sessionStore } from '$lib/stores/session.store.js';

	let { data } = $props();

	const { resp, followUser, unfollowUser } = useUser(data.accessToken, data.id, $sessionStore);

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

<div class="">
	<div class="mx-auto h-full max-w-[60rem] pb-12 lg:border-x lg:border-border lg:bg-card">
		<div class="overflow-hidden bg-card shadow-lg">
			{#if resp.isLoading}
				<ProfileHeaderSkeleton />
			{:else if resp.user}
				<ProfileHeader
					followers={resp.followers}
					{followUser}
					{unfollowUser}
					following={resp.following}
					user={resp.user}
					isFollowing={resp.isFollowing}
				/>
			{/if}
			<nav class="relative flex border-t border-border">
				{#each tabs as tab}
					<button
						class="flex-1 px-6 py-4 text-sm font-medium transition-colors hover:bg-accent"
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

		<div class="container pt-8">
			{#if activeTab === 'Posts'}
				<div in:fade={{ duration: 300, easing: quintOut }}>
					<ProfileFeed authToken={data.accessToken} userId={data.id} />
				</div>
			{:else if activeTab === 'Recipes'}
				<div in:fade={{ duration: 300, easing: quintOut }}>
					<RecipeFeed authToken={data.accessToken} userId={data.id} />
				</div>
			{:else if activeTab === 'Media'}
				<div in:fade={{ duration: 300, easing: quintOut }}>
					<ProfileMedia authToken={data.accessToken} userId={data.id} />
				</div>
			{/if}
		</div>
	</div>
</div>
