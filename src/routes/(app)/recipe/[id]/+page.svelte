<script lang="ts">
	import Icon from '@iconify/svelte';
	import { Editor as TipTapEditor } from '@tiptap/core';
	import Image from '@tiptap/extension-image';
	import Link from '@tiptap/extension-link';
	import StarterKit from '@tiptap/starter-kit';
	import { elasticOut } from 'svelte/easing';
	import { fade, slide } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { useRecipe } from '$lib/api/use-recipe.svelte.js';
	import { cn } from '$lib/cn.js';
	import RecipeSingleCardSkeleton from '$lib/components/skeleton/recipe-single-card-skeleton.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Dropdown } from '$lib/components/ui/dropdown/index.js';
	import { Editor } from '$lib/components/ui/editor/index.js';
	import { Field } from '$lib/components/ui/field/index.js';
	import { Input, inputVariants } from '$lib/components/ui/input/index.js';
	import { ConfirmModal, ImageModal } from '$lib/components/ui/modals/index.js';
	import { sessionStore } from '$lib/stores/session.store.js';
	import type { CreateRecipe } from '$lib/types/recipe.types.js';
	import { capitalize } from '$lib/utils.js';
	import { formatTimestamp } from '$lib/date.js';
	import { Avatar } from '$lib/components/ui/avatar/index.js';

	let { data } = $props();
	const { res, deleteRecipe, recipeLikeToggle, updateRecipe } = useRecipe(
		data.accessToken,
		+data.recipeId
	);

	let editor = $state<TipTapEditor>();
	let currentImageIndex = $state(0);
	let isImageModalOpen = $state(false);
	let hasNextImage = $derived(res.recipe && currentImageIndex < res.recipe.images.length - 1);
	let hasPrevImage = $derived(currentImageIndex > 0);
	let isDeleteModalConfirmOpen = $state(false);
	let isSettingsOpen = $state(false);
	let isSubmittingDelete = $state(false);
	let isLiked = $state(
		res.recipe && res.recipe.reactions.some((reaction) => reaction.user.id === $sessionStore.id)
	);
	let submittingLike = $state(false);
	let isEditing = $state(false);
	let editedRecipe = $state<CreateRecipe>({
		categoryId: 0,
		title: '',
		content: {},
		ingredients: [] as string[],
		preparationTime: 0,
		cookingTime: 0,
		servings: 0,
		difficulty: '',
		imageUrls: [] as string[]
	});

	$effect(() => {
		if (res.recipe) {
			editor = new TipTapEditor({
				extensions: [StarterKit, Image, Link],
				content: res.recipe.content,
				editable: false
			});

			editedRecipe = {
				categoryId: res.recipe.category.id,
				title: res.recipe.title,
				content: res.recipe.content,
				ingredients: res.recipe.ingredients,
				preparationTime: res.recipe.preparationTime,
				cookingTime: res.recipe.cookingTime,
				servings: res.recipe.servings,
				difficulty: res.recipe.difficulty,
				imageUrls: res.recipe.images.map((img) => img.imageUrl)
			};

			isLiked =
				res.recipe &&
				res.recipe.reactions.some((reaction) => reaction.user.id === $sessionStore.id);

			return () => {
				if (editor) {
					editor.destroy();
				}
			};
		}
	});

	function getDifficultyColor(difficulty: string): string {
		switch (difficulty.toLowerCase()) {
			case 'easy':
				return 'text-green-500';
			case 'medium':
				return 'text-yellow-500';
			case 'hard':
				return 'text-red-500';
			default:
				return 'text-gray-500';
		}
	}

	function nextImage() {
		if (res.recipe && currentImageIndex < res.recipe.images.length - 1) {
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

	async function handleDeletePost() {
		if (res.recipe) {
			isSubmittingDelete = true;
			await deleteRecipe();
			isDeleteModalConfirmOpen = false;
			isSubmittingDelete = false;
			goto('/profile');
		}
	}

	async function handleToggleLike() {
		submittingLike = true;
		await recipeLikeToggle(isLiked!);
		submittingLike = false;
		isLiked = !isLiked;
	}

	function toggleEditMode() {
		isEditing = !isEditing;
		if (isEditing) {
			editor?.setEditable(true);
		} else {
			editor?.setEditable(false);
		}
		isSettingsOpen = false;
	}

	function handleContentUpdate(newContent: object) {
		editedRecipe.content = newContent;
	}

	async function handleSubmitEdit() {
		if (res.recipe) {
			await updateRecipe(editedRecipe);
			isEditing = false;
			editor?.setEditable(false);
		}
	}

	function addIngredient() {
		editedRecipe.ingredients = [...editedRecipe.ingredients, ''];
	}

	function removeIngredient(index: number) {
		editedRecipe.ingredients = editedRecipe.ingredients.filter((_, i) => i !== index);
	}
</script>

<svelte:head>
	<title>Vemeet - {res.recipe?.title}</title>
</svelte:head>

<div class="container bg-card pb-12">
	{#if res.isLoading}
		<RecipeSingleCardSkeleton />
	{:else if res.recipe}
		<div class="relative">
			{#if res.recipe.user.id === $sessionStore.id}
				<div class="absolute right-0 top-8 z-10">
					<Dropdown
						triggerIcon="solar:menu-dots-bold"
						bind:isOpen={isSettingsOpen}
						triggerClass="size-8 flex min-w-0 p-0 shadow-none justify-center bg-none rounded-full hover:bg-none transition-colors border-none"
						triggerIconClass="m-0 p-0 size-7 hover:text-primary"
						class="right-0 top-10"
					>
						<div class="flex w-full flex-col gap-1 p-1">
							<Button
								variant="ghost"
								size="sm"
								class="flex w-full justify-start"
								onclick={toggleEditMode}
							>
								<Icon icon="solar:pen-bold" class="mr-2" />
								{isEditing ? 'Cancel Edit' : 'Edit'}
							</Button>
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
			<header class={cn('mb-8 pt-8', isEditing && 'pt-20')}>
				{#if isEditing}
					<Field name="Title">
						<Input id="title" bind:value={editedRecipe.title} required />
					</Field>
				{:else}
					<h1 class="mb-4 text-4xl font-bold">{res.recipe.title}</h1>
				{/if}
			</header>

			{#if isEditing}
				<div class="mb-8">
					<Field name="Recipe Images">
						<p class="text-sm text-muted-foreground">
							Image upload functionality to be implemented
						</p>
					</Field>
				</div>
			{:else if res.recipe.images && res.recipe.images.length > 0}
				<div class="relative mb-8">
					<div
						role="button"
						tabindex="0"
						aria-label="Open image gallery"
						aria-describedby="image-description"
						onkeydown={(e) => e.key === 'Enter' && (isImageModalOpen = true)}
						onclick={() => (isImageModalOpen = true)}
						class="h-[20rem] w-full overflow-hidden rounded-lg"
					>
						{#key currentImageIndex}
							<img
								src={res.recipe.images[currentImageIndex].imageUrl}
								alt={`Recipe image ${currentImageIndex + 1}`}
								class="aspect-video h-full w-full object-cover object-center transition-transform duration-300 hover:scale-105"
								in:slide={{
									duration: 300,
									axis: 'x'
								}}
								out:fade={{ duration: 200, easing: elasticOut }}
							/>
						{/key}
					</div>
					{#if res.recipe.images.length > 1}
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
				{#if res.recipe.images.length > 1}
					<div class="mb-6 flex justify-center space-x-1.5 py-8">
						{#each res.recipe.images as _, index}
							<button
								aria-label="Change image"
								class="h-2.5 w-2.5 rounded-full transition-colors"
								class:bg-primary={index === currentImageIndex}
								class:bg-gray-300={index !== currentImageIndex}
								onclick={() => setImage(index)}
							></button>
						{/each}
					</div>
				{/if}
			{/if}

			<div
				class={cn(
					'flex w-full flex-col items-start justify-start gap-4 ',
					isEditing
						? 'md:flex md:grid-cols-1 '
						: ' md:grid md:grid-cols-[35%,1fr] md:items-center md:justify-between md:gap-4'
				)}
			>
				{#if !isEditing}
					<div class="flex items-center">
						<Avatar user={res.recipe.user} class="mr-4 size-12" />
						<div>
							<p class="text-lg font-semibold text-gray-800">{res.recipe.user.username}</p>
							<p class="text-sm text-gray-600">{formatTimestamp(res.recipe.createdAt)}</p>
						</div>
					</div>
				{/if}
				<div
					class={cn(
						'mt-2 grid w-full space-y-2 ',
						!isEditing && 'md:flex md:items-center md:justify-end md:gap-4 md:space-y-0'
					)}
				>
					{#if isEditing}
						<Field name="Category">
							<select
								id="category"
								bind:value={editedRecipe.categoryId}
								class={cn(inputVariants({ variant: 'default' }))}
								required
							>
								{#each res.categories as category}
									<option value={category.id}>{category.name}</option>
								{/each}
							</select>
						</Field>
						<Field name="Preparation Time" description="in minutes">
							<Input
								id="preparationTime"
								type="number"
								bind:value={editedRecipe.preparationTime}
								required
							/>
						</Field>
						<Field name="Cooking Time" description="in minutes">
							<Input
								id="cookingTime"
								type="number"
								bind:value={editedRecipe.cookingTime}
								required
							/>
						</Field>
						<Field name="Servings">
							<Input id="servings" type="number" bind:value={editedRecipe.servings} required />
						</Field>
						<Field name="Difficulty">
							<select
								id="difficulty"
								bind:value={editedRecipe.difficulty}
								class={cn(inputVariants({ variant: 'default' }))}
								required
							>
								<option value="easy">Easy</option>
								<option value="medium">Medium</option>
								<option value="hard">Hard</option>
							</select>
						</Field>
					{:else}
						<div class="flex items-center justify-start gap-4">
							<span class="flex items-center">
								<Icon icon="mdi:clock-outline" class="mr-1 size-7" />
								<span class="text-muted-foreground">Prep: {res.recipe.preparationTime} mins</span>
							</span>
							<span class="flex items-center">
								<Icon icon="mdi:pot-steam-outline" class="mr-1 size-7" />
								<span class="text-muted-foreground">Cook: {res.recipe.cookingTime} mins</span>
							</span>
						</div>
						<div
							class="grid space-y-2 md:flex md:items-center md:justify-center md:gap-4 md:space-y-0"
						>
							<span class="flex items-center">
								<Icon icon="mdi:account-group-outline" class="mr-1 size-7" />
								<span class="text-muted-foreground">Serves: {res.recipe.servings}</span>
							</span>
							<span class="flex items-center">
								<Icon
									icon="mdi:chef-hat"
									class={cn('mr-1 size-7', getDifficultyColor(res.recipe.difficulty))}
								/>
								<span class={cn('text-sm font-medium', getDifficultyColor(res.recipe.difficulty))}>
									{capitalize(res.recipe.difficulty)}
								</span>
							</span>
						</div>
					{/if}
				</div>
			</div>

			<div>
				<h2 class="mb-4 mt-8 text-3xl font-semibold">Ingredients</h2>
				{#if isEditing}
					<div class="space-y-2">
						{#each editedRecipe.ingredients as _, index}
							<div class="flex items-center space-x-2">
								<Input bind:value={editedRecipe.ingredients[index]} />
								<Button
									type="button"
									size="icon-xs"
									onclick={() => removeIngredient(index)}
									variant="destructive"
								>
									<Icon icon="mdi:minus" class="size-4" />
								</Button>
							</div>
						{/each}
						<Button type="button" onclick={addIngredient} size="sm" variant="outline">
							<Icon icon="mdi:plus" class="mr-2 size-4" />
							Add Ingredient
						</Button>
					</div>
				{:else}
					<ul class="space-y-2">
						{#each res.recipe.ingredients as ingredient}
							<li class="flex items-center">
								<span class="mr-3 size-[5px] rounded-full bg-primary"></span>
								<span class="font-medium">{ingredient}</span>
							</li>
						{/each}
					</ul>
				{/if}
			</div>

			<div class="mb-8 mt-6 grid grid-cols-1 gap-8 py-8 md:grid-cols-3">
				<div class="md:col-span-2">
					<h2 class="mb-4 text-3xl font-semibold">Instructions</h2>
					{#if isEditing}
						<Editor bind:content={editedRecipe.content} update={handleContentUpdate} />
					{:else}
						<div class="prose prose-sm max-w-none">
							{#if editor}
								<!-- eslint-disable-next-line svelte/no-at-html-tags -->
								{@html editor.getHTML()}
							{/if}
						</div>
					{/if}
				</div>
			</div>

			{#if isEditing}
				<div class="mb-8 pb-12">
					<Button onclick={handleSubmitEdit} disabled={res.isSubmittingUpdate}>
						{res.isSubmittingUpdate ? 'Updating...' : 'Update Recipe'}
					</Button>
				</div>
			{:else}
				<div class="-mx-6 border-t border-border px-8 py-4 md:px-4">
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
						<span class="ml-1.5 font-medium">{res.recipe.reactions.length}</span>
					</button>
				</div>

				<div class="-mx-6 border-t border-border px-8 py-6 md:px-4">
					<h2 class="mb-4 text-2xl font-semibold">Comments</h2>
					<p class="italic text-gray-600">Comments section coming soon...</p>
				</div>
			{/if}
		</div>
	{/if}
</div>

{#if isImageModalOpen && res.recipe}
	<ImageModal
		src={res.recipe.images[currentImageIndex].imageUrl}
		alt={`Full size recipe image ${currentImageIndex + 1}`}
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

<style lang="postcss">
	:global(.prose) {
		@apply text-gray-800;
	}
	:global(.prose h1) {
		@apply mb-4 text-3xl font-bold;
	}
	:global(.prose h2) {
		@apply mb-3 text-2xl font-semibold;
	}
	:global(.prose h3) {
		@apply mb-2 text-xl font-medium;
	}
	:global(.prose p) {
		@apply mb-4;
	}
	:global(.prose ul) {
		@apply mb-4 list-disc pl-5;
	}
	:global(.prose ol) {
		@apply mb-4 list-decimal pl-5;
	}
	:global(.prose img) {
		@apply my-4 h-auto max-w-full rounded-lg shadow-md;
	}
	:global(.prose a) {
		@apply text-primary hover:underline;
	}
	:global(.prose blockquote) {
		@apply my-4 border-l-4 border-gray-300 pl-4 italic;
	}
</style>
