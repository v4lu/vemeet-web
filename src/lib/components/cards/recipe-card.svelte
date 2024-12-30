<script lang="ts">
	import Icon from '@iconify/svelte';
	import { elasticOut } from 'svelte/easing';
	import { fade, slide } from 'svelte/transition';
	import { Avatar } from '../ui/avatar';
	import { Button, buttonVariants } from '../ui/button';
	import { Dropdown } from '../ui/dropdown';
	import { ConfirmModal, ImageModal } from '../ui/modals';
	import type { Recipe } from '$lib/types/recipe.types';
	import { sessionStore } from '$lib/stores/session.store';
	import { formatTimestamp } from '$lib/date';
	import { cn } from '$lib/cn';

	type Props = {
		recipe: Recipe;
		recipeLikeToggle: (recipeId: number, isLiked: boolean) => Promise<void>;
		deleteRecipe: (recipeId: number) => Promise<void>;
	};

	let { recipe, recipeLikeToggle, deleteRecipe }: Props = $props();
	let currentImageIndex = $state(0);
	let isSettingsOpen = $state(false);
	let isImageModalOpen = $state(false);
	let submittingLike = $state(false);
	let isDeleteModalConfirmOpen = $state(false);
	let isSubmittingDelete = $state(false);

	let isLiked = $state(
		recipe.reactions.some(
			(reaction) => reaction.user.id === $sessionStore.id && reaction.reactionType === 'LIKE'
		)
	);

	let hasNextImage = $derived(currentImageIndex < recipe.images.length - 1);
	let hasPrevImage = $derived(currentImageIndex > 0);

	function nextImage() {
		if (currentImageIndex < recipe.images.length - 1) {
			currentImageIndex++;
		}
	}

	function prevImage() {
		if (currentImageIndex > 0) {
			currentImageIndex--;
		}
	}

	function setImage(index: number) {
		currentImageIndex = index;
	}

	async function handleToggleLike() {
		submittingLike = true;
		await recipeLikeToggle(recipe.id, isLiked);
		submittingLike = false;
		isLiked = !isLiked;
	}

	async function handleDeletePost() {
		if (deleteRecipe) {
			isSubmittingDelete = true;
			await deleteRecipe(recipe.id);
			isDeleteModalConfirmOpen = false;
			isSubmittingDelete = false;
		}
	}
</script>

<div
	class="relative mb-6 overflow-hidden rounded-xl border border-border bg-card shadow-lg transition-all duration-300 hover:shadow-xl"
>
	{#if recipe.user.id === $sessionStore.id}
		<div class="absolute right-3 top-3 z-10">
			<Dropdown
				triggerIcon="solar:menu-dots-bold"
				bind:isOpen={isSettingsOpen}
				triggerClass="size-8 flex min-w-0 p-0 shadow-none justify-center bg-none rounded-full hover:bg-none transition-colors border-none"
				triggerIconClass="m-0 p-0 size-5 hover:text-primary"
				class="right-0 top-10"
			>
				<div class="flex w-full flex-col gap-1 p-1">
					<a
						href={`/recipe/${recipe.id}`}
						class={cn(
							buttonVariants({
								variant: 'ghost',
								size: 'sm'
							}),
							'flex w-full justify-start'
						)}
					>
						<Icon icon="solar:pen-bold" class="mr-2" />
						Edit
					</a>
					<Button
						variant="ghost"
						size="sm"
						class="flex w-full justify-start text-destructive transition-colors hover:bg-destructive/10 hover:text-destructive"
						onclick={() => {
							isDeleteModalConfirmOpen = true;
							isSettingsOpen = false;
						}}
					>
						<Icon icon="solar:trash-bin-2-bold" class="mr-2" />
						Delete
					</Button>
				</div>
			</Dropdown>
		</div>
	{/if}

	<div class="relative mb-4 flex items-center justify-between p-4">
		<div class="flex items-center">
			<a href={`/profile/${recipe.user.id}`}>
				<Avatar class="mr-3 size-12" user={recipe.user} />
			</a>

			<div>
				<a
					href={`/profile/${recipe.user.id}`}
					class="font-semibold text-foreground transition-colors duration-200 hover:text-primary"
					>{recipe.user.username}</a
				>
				<p class="text-xs text-muted-foreground">{formatTimestamp(recipe.createdAt)}</p>
			</div>
		</div>
	</div>

	{#if recipe.images && recipe.images.length > 0}
		<div class="relative mb-4">
			<div
				role="button"
				tabindex="0"
				aria-label="Open image gallery"
				aria-describedby="image-description"
				onkeydown={(e) => e.key === 'Enter' && (isImageModalOpen = true)}
				onclick={() => (isImageModalOpen = true)}
				class="h-[20rem] w-full overflow-hidden"
			>
				{#key currentImageIndex}
					<img
						src={recipe.images[currentImageIndex].imageUrl}
						alt="Post"
						class="h-full w-full object-cover object-center transition-transform duration-300 hover:scale-105"
						in:slide={{
							duration: 300,
							axis: 'x'
						}}
						out:fade={{ duration: 200, easing: elasticOut }}
					/>
				{/key}
			</div>
			{#if recipe.images.length > 1}
				{#if hasPrevImage}
					<button
						class="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
						onclick={prevImage}
					>
						<Icon class="size-5" icon="lucide:chevron-left" />
					</button>
				{/if}
				{#if hasNextImage}
					<button
						class="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
						onclick={nextImage}
					>
						<Icon class="size-5" icon="lucide:chevron-right" />
					</button>
				{/if}
			{/if}
		</div>
		{#if recipe.images.length > 1}
			<div class="mb-3 flex justify-center space-x-1.5">
				{#each recipe.images as _, index}
					<button
						aria-labelledby="image-description"
						class="h-2.5 w-2.5 rounded-full transition-colors"
						class:bg-primary={index === currentImageIndex}
						class:bg-gray-300={index !== currentImageIndex}
						onclick={() => setImage(index)}
					></button>
				{/each}
			</div>
		{/if}
	{/if}
	<a
		href={`/recipe/${recipe.id}`}
		class="px-4 text-lg font-bold text-foreground transition-colors duration-200 hover:text-primary hover:underline"
		>{recipe.title}</a
	>
	<div class="mt-2 flex items-center justify-between border-t border-border p-4">
		<div class="flex w-full items-center justify-between">
			<div class="flex items-center space-x-4">
				<button
					class="group flex items-center text-sm transition-colors"
					onclick={handleToggleLike}
					disabled={submittingLike}
				>
					<Icon
						icon={isLiked ? 'solar:heart-angle-bold' : 'solar:heart-angle-line-duotone'}
						class={cn(
							'size-6 transition-colors',
							isLiked ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
						)}
					/>
					<span class="ml-1.5 font-medium">{recipe.reactions.length}</span>
				</button>
				<a
					href={`/recipe/${recipe.id}`}
					class="flex items-center text-sm text-muted-foreground transition-colors hover:text-primary"
				>
					<Icon icon="solar:chat-round-line-bold" class="size-6" />
					<span class="ml-1.5 font-medium"> 0 </span>
				</a>
			</div>
			<button
				disabled={true}
				class="flex cursor-not-allowed items-center text-sm text-muted-foreground transition-colors hover:text-primary"
			>
				<Icon icon="solar:multiple-forward-right-bold" class="size-6" />
				<span class="ml-1.5 font-medium">Share</span>
			</button>
		</div>
	</div>
</div>

{#if isImageModalOpen}
	<ImageModal
		src={recipe.images[currentImageIndex].imageUrl}
		alt="Full size post image"
		onClose={() => (isImageModalOpen = false)}
	/>
{/if}

{#if isDeleteModalConfirmOpen}
	<ConfirmModal
		title="Delete Content"
		desc="Deleting content is a permanent action. Recipe will be removed and cannot be recovered."
		onClose={() => (isDeleteModalConfirmOpen = false)}
		onConfirm={handleDeletePost}
		submitting={isSubmittingDelete}
		confirmText="Delete Recipe"
	/>
{/if}
{#if isDeleteModalConfirmOpen}
	<ConfirmModal
		title="Delete Content"
		desc="Deleting content is a permanent action. Recipe will be removed and cannot be recovered."
		onClose={() => (isDeleteModalConfirmOpen = false)}
		onConfirm={handleDeletePost}
		submitting={isSubmittingDelete}
		confirmText="Delete REcipe"
	/>
{/if}
