<script lang="ts">
	import { useRecipes } from '$lib/api/use-recipes.svelte';
	import { sessionStore } from '$lib/stores/session.store';
	import Icon from '@iconify/svelte';
	import { CreateRecipe } from '.';
	import { Button } from '../ui/button';
	import ProfileSessionRecipeFeed from './profile-session-recipe-feed.svelte';

	type Props = {
		authToken: string;
	};
	let { authToken }: Props = $props();
	const { createCategory, createRecipe, res, loadRecipes, recipeLikeToggle, deleteRecipe } =
		useRecipes(authToken, $sessionStore.id);

	let isOpenCreateRecipe = $state(false);
</script>

<div class="mb-12 mt-8 space-y-6">
	<Button class="w-full" onclick={() => (isOpenCreateRecipe = !isOpenCreateRecipe)}>
		<Icon icon="solar:chef-hat-bold" class="mr-2 size-5" />
		{!isOpenCreateRecipe ? 'Create New Recipe' : 'Hide Creator'}</Button
	>

	{#if isOpenCreateRecipe}
		<CreateRecipe
			close={() => (isOpenCreateRecipe = false)}
			{authToken}
			{createCategory}
			{createRecipe}
			categories={res.categories}
		/>
	{/if}
	<ProfileSessionRecipeFeed
		currentPage={res.currentPage}
		hasMore={res.hasMore}
		isLoading={res.isLoadingRecipes}
		{loadRecipes}
		recipes={res.recipes}
		{recipeLikeToggle}
		{deleteRecipe}
	/>
</div>
