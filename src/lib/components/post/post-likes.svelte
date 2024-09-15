<script lang="ts">
	import { cn } from '$lib/cn';
	import { sessionStore } from '$lib/stores/session.store';
	import type { Reaction } from '$lib/types/reaction.types';
	import Icon from '@iconify/svelte';
	import { UserHorizontalCard } from '../cards';
	import { Modal } from '../ui/modals';

	type PostLikesProps = {
		handlePostLike: (isLiked: boolean, userId: number) => void;
		reactions: Reaction[];
	};
	let { handlePostLike, reactions }: PostLikesProps = $props();

	let isLikeModalOpen = $state(false);
	let isLiked = $state(
		reactions.some(
			(reaction) => reaction.user.id === $sessionStore.id && reaction.reactionType === 'LIKE'
		)
	);
</script>

<div class="flex items-center">
	<button
		onclick={() => {
			handlePostLike(isLiked, $sessionStore.id);
			isLiked = !isLiked;
		}}
		class="group mr-2 flex items-center text-sm transition-colors"
	>
		<Icon
			icon={isLiked ? 'solar:heart-angle-bold' : 'solar:heart-angle-line-duotone'}
			class={cn(
				'size-5 transition-colors',
				isLiked ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
			)}
		/>
	</button>
	<button
		onclick={() => {
			isLikeModalOpen = true;
		}}
		class="text-sm text-muted-foreground hover:text-primary"
	>
		{reactions.length} Likes
	</button>
</div>

{#if isLikeModalOpen}
	<Modal onClose={() => (isLikeModalOpen = false)}>
		<div class="hide-scrollbar max-h-[25rem] overflow-y-auto">
			<h2 class="mb-4 text-xl font-semibold">Likes</h2>
			<div class="grid gap-2">
				{#each reactions as { user }}
					<UserHorizontalCard {user} />
				{/each}
			</div>
		</div>
	</Modal>
{/if}

<style lang="postcss">
	.hide-scrollbar {
		-ms-overflow-style: none; /* IE and Edge */
		scrollbar-width: none; /* Firefox */
	}

	.hide-scrollbar::-webkit-scrollbar {
		display: none; /* Chrome, Safari and Opera */
	}
</style>
