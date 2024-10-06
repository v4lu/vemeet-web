<script lang="ts">
	import { useSwiperMessages } from '$lib/api/use-swiper-messages.svelte';
	import { Skeleton } from '$lib/components/ui/skeleton';

	let { data } = $props();
	const { resp } = useSwiperMessages(data.accessToken);
</script>

<div class="container mb-12 mt-8">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-2xl font-bold">Matches</h1>
	</div>

	{#if resp.isLoading}
		<div class="space-y-2">
			{#each Array(5) as _}
				<Skeleton class="h-14 w-full" />
			{/each}
		</div>
	{:else if resp.matches}
		<div class="space-y-2">
			{#each resp.matches as match}
				<a href="/" class="flex cursor-pointer items-center rounded-md p-3 hover:bg-accent">
					<div class="relative mr-4">
						<img
							src={match.profileImage?.url || '/placeholder-user.webp'}
							class="size-12 rounded-full bg-cover bg-center object-cover object-center"
							alt={match.username}
						/>
					</div>
					<div class="flex-1">
						<div class="flex items-center justify-between">
							<h2 class="font-semibold">{match.username}</h2>
						</div>
					</div>
				</a>
			{/each}
		</div>
	{:else}
		<p>No matches found.</p>
	{/if}
</div>
