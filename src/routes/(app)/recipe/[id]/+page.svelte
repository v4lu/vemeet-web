<script lang="ts">
	import { useRecipe } from '$lib/api/use-single-recipe.svelte';
	import { cn } from '$lib/cn.js';
	import { Avatar } from '$lib/components/ui/avatar';
	import { ImageModal } from '$lib/components/ui/modals/index.js';
	import { formatTimestamp } from '$lib/date';
	import { capitalize } from '$lib/utils';
	import Icon from '@iconify/svelte';
	import { Editor } from '@tiptap/core';
	import Image from '@tiptap/extension-image';
	import Link from '@tiptap/extension-link';
	import StarterKit from '@tiptap/starter-kit';
	import { elasticOut } from 'svelte/easing';
	import { fade, slide } from 'svelte/transition';

	let { data } = $props();
	const { res } = useRecipe(data.accessToken, +data.recipeId);

	let editor = $state<Editor>();
	let currentImageIndex = $state(0);
	let isImageModalOpen = $state(false);
	let hasNextImage = $derived(res.recipe && currentImageIndex < res.recipe.images.length - 1);
	let hasPrevImage = $derived(currentImageIndex > 0);

	$effect(() => {
		if (res.recipe) {
			editor = new Editor({
				extensions: [StarterKit, Image, Link],
				content: res.recipe.content,
				editable: false
			});

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
</script>

<div class="mb-12 mt-8">
	{#if res.isLoading}
		<p class="my-8 text-center text-gray-600">Loading...</p>
	{:else if res.recipe}
		<div class="mx-auto max-w-4xl rounded-lg bg-white px-5 py-8 shadow-lg">
			<header class="mb-8">
				<h1 class="mb-4 text-4xl font-bold">{res.recipe.title}</h1>
				<div class="flex flex-col items-start justify-start gap-4">
					<div class="flex items-center">
						<Avatar user={res.recipe.user} class="mr-4 size-12" />
						<div>
							<p class="text-lg font-semibold text-gray-800">{res.recipe.user.username}</p>
							<p class="text-sm text-gray-600">{formatTimestamp(res.recipe.createdAt)}</p>
						</div>
					</div>
					<div class="mt-2 grid space-y-2">
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
						<div class="grid space-y-2">
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
					</div>
				</div>
			</header>

			{#if res.recipe.images && res.recipe.images.length > 0}
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
								class="h-full w-full object-cover object-center transition-transform duration-300 hover:scale-105"
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
					<div class="mb-6 flex justify-center space-x-1.5">
						{#each res.recipe.images as _, index}
							<button
								class="h-2.5 w-2.5 rounded-full transition-colors"
								class:bg-primary={index === currentImageIndex}
								class:bg-gray-300={index !== currentImageIndex}
								onclick={() => setImage(index)}
							></button>
						{/each}
					</div>
				{/if}
			{/if}

			<div>
				<h2 class="mb-4 text-3xl font-semibold">Ingredients</h2>
				<ul class="space-y-2">
					{#each res.recipe.ingredients as ingredient}
						<li class="flex items-center">
							<span class="mr-3 size-[5px] rounded-full bg-primary"></span>
							<span class="text-gray-700">{ingredient}</span>
						</li>
					{/each}
				</ul>
			</div>

			<div class="mb-8 mt-6 grid grid-cols-1 gap-8 md:grid-cols-3">
				<div class="md:col-span-2">
					<h2 class="mb-4 text-3xl font-semibold">Instructions</h2>
					<div class="prose prose-sm max-w-none">
						{#if editor}
							<!-- eslint-disable-next-line svelte/no-at-html-tags -->
							{@html editor.getHTML()}
						{/if}
					</div>
				</div>
			</div>

			<div class="border-t border-gray-200 pt-6">
				<h2 class="mb-4 text-2xl font-semibold">Comments</h2>
				<p class="italic text-gray-600">Comments section coming soon...</p>
			</div>
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
