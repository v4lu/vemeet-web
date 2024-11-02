<script lang="ts">
	import { useSwiperMessages } from '$lib/api/use-swiper-messages.svelte';
	import { CustomHeaderWithTitle } from '$lib/components/ui/custom-header';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { sessionStore } from '$lib/stores/session.store.js';
	import Icon from '@iconify/svelte';

	let { data } = $props();
	const { resp } = useSwiperMessages(data.accessToken);
</script>

<CustomHeaderWithTitle title="Your Matches" />

<div class="container min-h-full bg-background py-4 lg:border-x lg:border-border lg:bg-card">
	<div class="mx-auto space-y-6">
		<div class="space-y-2">
			<h2 class="text-xl font-semibold tracking-tight sm:text-2xl">Match List</h2>
			<p class="text-sm text-muted-foreground">Connect and chat with people you've matched with</p>
		</div>

		{#if resp.isLoading}
			<div class="space-y-4 rounded-lg border bg-card p-4 shadow-sm">
				{#each Array(5) as _}
					<div class="flex items-center space-x-4">
						<Skeleton class="size-12 rounded-full" />
						<div class="flex-1 space-y-2">
							<Skeleton class="h-4 w-1/4" />
							<Skeleton class="h-3 w-1/3" />
						</div>
					</div>
				{/each}
			</div>
		{:else if resp.matches && resp.matches.length > 0}
			<div class="space-y-1 rounded-lg border bg-card shadow-sm">
				{#each resp.matches as match}
					<a
						href={`/messages/${$sessionStore.id}/${match.id}`}
						class="flex items-center space-x-4 p-4 transition-colors hover:bg-accent/50"
					>
						<div class="relative">
							<img
								src={match.profileImage?.url || '/placeholder-user.webp'}
								class="size-12 rounded-full border-2 border-background object-cover shadow-sm"
								alt={match.username}
							/>
							<div
								class="absolute bottom-0 right-0 size-3 rounded-full border-2 border-background bg-primary"
							></div>
						</div>
						<div class="min-w-0 flex-1">
							<div class="flex items-center justify-between">
								<h3 class="truncate text-base font-medium sm:text-lg">{match.username}</h3>
								<Icon icon="solar:arrow-right-bold" class="size-5 text-muted-foreground" />
							</div>
							<p class="truncate text-sm text-muted-foreground">Click to start chatting</p>
						</div>
					</a>
					{#if match !== resp.matches[resp.matches.length - 1]}
						<div class="border-t border-border/50"></div>
					{/if}
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

		<div class="rounded-lg border bg-card/50 p-4">
			<div class="flex items-start space-x-2">
				<Icon icon="solar:info-circle-bold" class="mt-1 size-5 text-muted-foreground" />
				<div class="flex-1 text-sm text-muted-foreground">
					<p>
						These are people you've matched with. Start a conversation by clicking on their profile.
					</p>
				</div>
			</div>
		</div>
	</div>
</div>
