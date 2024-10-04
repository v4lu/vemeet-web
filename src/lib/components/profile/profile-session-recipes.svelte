<script lang="ts">
	import { useProfileRecipe } from '$lib/api/use-profile-recipe.svelte';
	import Icon from '@iconify/svelte';
	import { CreateRecipe } from '.';
	import { Button } from '../ui/button';

	type Props = {
		authToken: string;
	};
	let { authToken }: Props = $props();
	const { createCategory, createRecipe, res } = useProfileRecipe(authToken);

	let isOpenCreateRecipe = $state(false);
</script>

<div class="mb-12 mt-8 space-y-6">
	<Button class="w-full" onclick={() => (isOpenCreateRecipe = !isOpenCreateRecipe)}>
		<Icon icon="solar:chef-hat-bold" class="mr-2 size-5" />
		{!isOpenCreateRecipe ? 'Create New Recipe' : 'Hide Creator'}</Button
	>

	{#if isOpenCreateRecipe}
		<CreateRecipe {authToken} {createCategory} {createRecipe} categories={res.categories} />
	{/if}
</div>
