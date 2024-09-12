<script lang="ts">
	import { Header, ProfilePosts } from '$lib/components/profile';

	let { data } = $props();
</script>

<Header authToken={data.accessToken} />
<nav class="my-2 flex">
	<span class="border-b-2 border-primary px-6 py-3 text-sm font-medium"> Posts </span>
	<span
		class="px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
	>
		Recipes
	</span>
	<span
		class="px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
	>
		Media
	</span>
</nav>
<ProfilePosts authToken={data.accessToken} />
