<script lang="ts">
	import Icon from '@iconify/svelte';
	import { useSwiperMessages } from '$lib/api/use-swiper-messages.svelte';
	import { CustomHeaderWithTitle } from '$lib/components/ui/custom-header';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { sessionStore } from '$lib/stores/session.store.js';
	import { MainWrapper } from '$lib/components/layout';

	let { data } = $props();
	const { resp } = useSwiperMessages(data.accessToken);
</script>

<CustomHeaderWithTitle title="Your Matches" />

<MainWrapper class=" bg-card px-0">
	<div class="space-y-6">
		<div class="mt-4 space-y-2">
			<h2 class="text-xl font-semibold tracking-tight sm:text-2xl">New Matches</h2>
			<p class="text-sm text-muted-foreground">Keep in touch with your connections</p>
		</div>

		<div class="space-y-6">
			{#if resp.isLoading}
				<div class="space-y-4 p-4">
					{#each Array(5) as _}
						<div class="flex items-center space-x-4">
							<Skeleton class="size-12 rounded-full" />
							<div class="flex-1 space-y-2">
								<Skeleton class="h-4 w-1/4" />
							</div>
						</div>
					{/each}
				</div>
			{:else if resp.matches && resp.matches.length > 0}
				<div class="space-y-1 rounded-lg border bg-card shadow-sm">
					{#each resp.matches as match}
						<a
							href={`/messages/${$sessionStore.id}/${match.id}`}
							class="flex items-center space-x-4 border-b border-border p-4 transition-colors last:rounded-lg hover:bg-accent/50"
						>
							<div class="relative">
								<img
									src={match.profileImage?.url || '/placeholder-user.webp'}
									class="size-12 rounded-full object-cover"
									alt={match.username}
								/>
							</div>
							<div class="min-w-0 flex-1">
								<div class="flex items-center justify-between">
									<h3 class="truncate text-base font-medium sm:text-lg">{match.username}</h3>
									<Icon icon="tabler:chevron-right" class="size-5 text-muted-foreground" />
								</div>
							</div>
						</a>
					{/each}
				</div>
			{:else}
				<div
					class="flex flex-col items-center justify-center rounded-lg border bg-card p-8 text-center shadow-sm"
				>
					<div class="flex size-16 items-center justify-center rounded-full bg-primary/10">
						<Icon icon="solar:users-group-rounded-bold" class="size-8 text-primary" />
					</div>
					<h3 class="mt-4 text-lg font-medium">No Matches Yet</h3>
					<p class="mt-2 text-sm text-muted-foreground">Keep swiping to find new connections</p>
				</div>
			{/if}
		</div>
	</div></MainWrapper
>
