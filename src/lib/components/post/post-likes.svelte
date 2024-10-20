<script lang="ts">
	import { cn } from '$lib/cn';
	import { sessionStore } from '$lib/stores/session.store';
	import type { Reaction } from '$lib/types/reaction.types';
	import Icon from '@iconify/svelte';
	import { UserHorizontalCard } from '../cards';
	import { Drawer } from '../ui/drawer';
	import { spring } from 'svelte/motion';

	type PostLikesProps = {
		handlePostLike: (isLiked: boolean) => void;
		reactions: Reaction[];
	};

	let { handlePostLike, reactions }: PostLikesProps = $props();
	let isLikeModalOpen = $state(false);
	let isLiked = $state(
		reactions.some(
			(reaction) => reaction.user.id === $sessionStore.id && reaction.reactionType === 'LIKE'
		)
	);

	const scale = spring(1);

	function handlePostLikeWithAnimation(isCurrentlyLiked: boolean) {
		scale.set(1.3).then(() => scale.set(1));
		handlePostLike(isCurrentlyLiked);
	}
</script>

<div class="flex items-center">
	<button
		onclick={() => {
			handlePostLikeWithAnimation(isLiked);
			isLiked = !isLiked;
		}}
		class="group mr-2 flex items-center text-sm transition-colors"
	>
		<div style="transform: scale({$scale})" class="transition-transform duration-300">
			<Icon
				icon={isLiked ? 'solar:heart-angle-bold' : 'solar:heart-angle-line-duotone'}
				class={cn(
					'size-5 transition-colors',
					isLiked ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
				)}
			/>
		</div>
	</button>
	<button
		onclick={() => {
			if (reactions.length > 0) isLikeModalOpen = true;
		}}
		class="text-sm text-muted-foreground hover:text-primary"
	>
		{reactions.length}
		{reactions.length === 1 ? 'Like' : 'Likes'}
	</button>
</div>

{#if isLikeModalOpen && reactions.length > 0}
	<Drawer onClose={() => (isLikeModalOpen = false)}>
		<div class="hide-scrollbar max-h-[25rem] overflow-y-auto">
			<h2 class="mb-4 text-xl font-semibold">Likes</h2>
			<div class="grid gap-2">
				{#each reactions as { user }}
					<UserHorizontalCard {user} />
				{/each}
			</div>
		</div>
	</Drawer>
{/if}

<style lang="postcss">
	.hide-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
	.hide-scrollbar::-webkit-scrollbar {
		display: none;
	}
</style>
