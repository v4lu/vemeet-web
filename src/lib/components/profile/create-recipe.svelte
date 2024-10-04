<script lang="ts">
	import { uploadImage } from '$lib/api';
	import { cn } from '$lib/cn';
	import { toast } from '$lib/stores/toast.store';
	import type { CreateRecipe, RecipeCategory } from '$lib/types/recipe.types';
	import Icon from '@iconify/svelte';
	import { Button } from '../ui/button';
	import { Editor } from '../ui/editor';
	import { Field } from '../ui/field';
	import { Input, inputVariants } from '../ui/input';

	type Props = {
		authToken: string;
		categories: RecipeCategory[];
		createRecipe: (payload: CreateRecipe) => Promise<void>;
		createCategory: (name: string) => Promise<void>;
	};
	let { authToken, categories, createCategory, createRecipe }: Props = $props();

	let title = $state('');
	let content = $state<object>({ type: 'doc', content: [{ type: 'paragraph' }] });
	let preparationTime = $state(15);
	let cookingTime = $state(30);
	let servings = $state(8);
	let difficulty = $state('MEDIUM');
	let ingredients = $state<string[]>([]);
	let newIngredient = $state('');
	let selectedCategory = $state<RecipeCategory | null>(null);
	let newCategory = $state('');
	let isAddingCategory = $state(false);
	let imageUrls = $state<string[]>([]);
	let fileInput: HTMLInputElement | null = $state(null);
	let imageUploadLoading = $state(false);

	function addIngredient() {
		if (newIngredient.trim()) {
			ingredients = [...ingredients, newIngredient.trim()];
			newIngredient = '';
		}
	}

	function removeIngredient(index: number) {
		ingredients = ingredients.filter((_, i) => i !== index);
	}

	function handleSubmit() {
		if (!selectedCategory) return;
		const payload: CreateRecipe = {
			title,
			content,
			ingredients,
			preparationTime,
			cookingTime,
			servings,
			difficulty,
			categoryId: selectedCategory?.id,
			imageUrls
		};
		createRecipe(payload);
	}

	function handleContentUpdate(newContent: object) {
		content = newContent;
	}

	function toggleAddCategory() {
		isAddingCategory = !isAddingCategory;
		if (!isAddingCategory) {
			newCategory = '';
		}
	}

	async function handleAddCategory() {
		if (newCategory.trim()) {
			await createCategory(newCategory.trim());
			newCategory = '';
			isAddingCategory = false;
			selectedCategory = categories[categories.length - 1];
		}
	}

	function handleInputFileClick(): void {
		if (!fileInput) return;
		fileInput.click();
	}

	async function handleImageUpload(event: Event): Promise<void> {
		const input = event.target as HTMLInputElement;
		if (input.files?.length) {
			const totalImages = imageUrls.length + input.files.length;
			if (totalImages <= 5) {
				imageUploadLoading = true;
				try {
					await Promise.all(
						Array.from(input.files).map((file) =>
							uploadImage({
								authToken,
								file,
								setImageUploadLoading: () => (imageUploadLoading = true),
								setImageUrl: (img) => (imageUrls = [img, ...imageUrls])
							})
						)
					);
				} catch (error) {
					console.error('Error uploading images:', error);
				} finally {
					imageUploadLoading = false;
				}
			} else {
				toast.error(`You can upload a maximum of 5 images.`);
			}
		}
	}

	function deleteImage(index: number): void {
		imageUrls = imageUrls.filter((_, i) => i !== index);
	}
</script>

<div
	class="my-6 space-y-4 rounded-lg border border-border bg-background p-6 shadow-lg transition-all duration-300 hover:shadow-xl"
>
	<Field name="Title">
		<Input id="title" bind:value={title} required />
	</Field>

	<Field name="Recipe Images">
		<div class="mb-4">
			<div class="flex items-center gap-2">
				<Button
					disabled={imageUploadLoading || imageUrls.length >= 5}
					onclick={handleInputFileClick}
					variant="outline"
					size="icon-sm"
					class=" transition-all duration-300 hover:bg-primary hover:text-white"
				>
					<Icon icon="solar:gallery-add-bold" class="size-5" />
				</Button>
				<input
					bind:this={fileInput}
					type="file"
					multiple
					class="hidden"
					onchange={handleImageUpload}
					accept="image/*"
				/>
				{#if imageUploadLoading}
					<Icon icon="eos-icons:loading" class="ml-2 size-5 animate-spin text-primary" />
				{/if}
			</div>
		</div>
		{#if imageUrls.length > 0}
			<div class="mb-4 flex flex-wrap gap-2">
				{#each imageUrls as imageUrl, i}
					<div class="relative h-24 w-24 overflow-hidden rounded-lg">
						<img
							src={imageUrl}
							alt="Recipe"
							class="h-full w-full object-cover object-center transition-transform duration-300 hover:scale-110"
						/>
						<button
							onclick={() => deleteImage(i)}
							class="absolute right-1 top-1 rounded-full bg-black bg-opacity-50 p-1 text-white transition-colors hover:bg-opacity-75"
							aria-label="Delete image"
						>
							<Icon icon="solar:close-circle-bold" class="size-4" />
						</button>
					</div>
				{/each}
			</div>
		{/if}
	</Field>

	<Field name="Category">
		<div class="flex space-x-2">
			{#if isAddingCategory}
				<Input bind:value={newCategory} placeholder="New category name" />
				<Button type="button" onclick={handleAddCategory} variant="outline">
					<Icon icon="mdi:check" class="size-5" />
				</Button>
			{:else}
				<select
					id="category"
					bind:value={selectedCategory}
					class={cn(inputVariants({ variant: 'default' }))}
					required
				>
					<option value="">Select a category</option>
					{#each categories as category}
						<option value={category}>{category.name}</option>
					{/each}
				</select>
			{/if}
			<Button size="icon" type="button" onclick={toggleAddCategory} variant="outline">
				<Icon icon={isAddingCategory ? 'mdi:close' : 'mdi:plus'} class="size-5" />
			</Button>
		</div>
	</Field>

	<Field name="Content (Introduction and Notes)">
		<Editor bind:content update={handleContentUpdate} />
	</Field>

	<Field name="Ingredients">
		<div class="flex space-x-2">
			<Input bind:value={newIngredient} placeholder="Enter ingredient" />
			<Button type="button" onclick={addIngredient} variant="outline">
				<Icon icon="mdi:plus" class="size-5" />
			</Button>
		</div>
		<ul class="mt-2 space-y-2">
			{#each ingredients as ingredient, index}
				<li class="flex items-center space-x-2">
					<span>{ingredient}</span>
					<Button type="button" onclick={() => removeIngredient(index)} variant="outline" size="sm">
						<Icon icon="mdi:minus" class="size-4" />
					</Button>
				</li>
			{/each}
		</ul>
	</Field>

	<div class="grid grid-cols-2 gap-4">
		<Field name="Preparation Time" description="in minutes">
			<Input id="preparationTime" type="number" bind:value={preparationTime} required />
		</Field>
		<Field name="Cooking Time" description="in minutes">
			<Input id="cookingTime" type="number" bind:value={cookingTime} required />
		</Field>
	</div>

	<Field name="Servings">
		<Input id="servings" type="number" bind:value={servings} required />
	</Field>

	<Field name="Difficulty">
		<select
			id="difficulty"
			bind:value={difficulty}
			class={cn(inputVariants({ variant: 'default' }))}
			required
		>
			<option value="EASY">Easy</option>
			<option value="MEDIUM">Medium</option>
			<option value="HARD">Hard</option>
		</select>
	</Field>

	<Button size="sm" onclick={handleSubmit}>Submit Recipe</Button>
</div>
