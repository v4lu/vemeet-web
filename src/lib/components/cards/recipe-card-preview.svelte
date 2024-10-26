<script lang="ts">
	import { cn } from '$lib/cn';
	import type { Recipe } from '$lib/types/recipe.types';
	import Icon from '@iconify/svelte';
	import { formatDistanceToNow } from 'date-fns';
	import { Avatar } from '../ui/avatar';

	type Props = {
		recipe: Recipe;
	};

	let { recipe }: Props = $props();

	function getDifficultyColor(difficulty: string) {
		switch (difficulty.toUpperCase()) {
			case 'EASY':
				return 'text-green-500';
			case 'MEDIUM':
				return 'text-amber-500';
			case 'HARD':
				return 'text-rose-500';
			default:
				return 'text-muted-foreground';
		}
	}
</script>

<div class="flex items-start gap-4 p-4 transition-colors hover:bg-muted/50">
	<div class="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
		{#if recipe.images?.[0]}
			<img src={recipe.images[0].imageUrl} alt={recipe.title} class="h-full w-full object-cover" />
		{:else}
			<div class="flex h-full w-full items-center justify-center bg-muted">
				<Icon icon="solar:bowl-chopsticks-bold" class="size-8 text-muted-foreground" />
			</div>
		{/if}
	</div>

	<div class="min-w-0 flex-1">
		<div class="flex items-start justify-between gap-2">
			<div>
				<h3 class="line-clamp-1 font-medium">{recipe.title}</h3>
				<div
					class="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground"
				>
					{#if recipe.category}
						<span class="flex items-center gap-1">
							<Icon icon="solar:cooking-pot-bold" class="size-4" />
							{recipe.category.name}
						</span>
					{/if}
					<span class="text-xs">•</span>
					<span class="flex items-center gap-1">
						<Icon icon="solar:clock-circle-bold" class="size-4" />
						{recipe.preparationTime + recipe.cookingTime}min
					</span>
					<span class="text-xs">•</span>
					<span class={cn('flex items-center gap-1', getDifficultyColor(recipe.difficulty))}>
						<Icon icon="solar:stars-bold" class="size-4" />
						{recipe.difficulty}
					</span>
				</div>
			</div>
			{#if recipe.reactions?.length}
				<div class="shrink-0 text-sm">
					<span class="flex items-center gap-1 text-rose-500">
						<Icon icon="solar:heart-bold" class="size-4" />
						{recipe.reactions.length}
					</span>
				</div>
			{/if}
		</div>
		<div class="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
			<Avatar user={recipe.user} class="size-6" />
			<span>{recipe.user.username}</span>
			<span>•</span>
			<span>{formatDistanceToNow(new Date(recipe.createdAt), { addSuffix: true })}</span>
		</div>
	</div>
</div>
