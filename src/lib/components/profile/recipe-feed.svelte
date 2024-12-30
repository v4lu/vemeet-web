<script lang="ts">
	import ProfileSessionRecipeFeed from './profile-session-recipe-feed.svelte';
	import { useRecipes } from '$lib/api/use-recipes.svelte';

	type Props = {
		authToken: string;
		userId: number;
	};
	let { authToken, userId }: Props = $props();
	const { res, loadRecipes, recipeLikeToggle, deleteRecipe } = useRecipes(authToken, userId);
</script>

<div class="mb-12 space-y-6">
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
