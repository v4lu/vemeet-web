<script lang="ts">
	import { CreatePost, Header } from '$lib/components/profile';

	let { data } = $props();
</script>

<Header authToken={data.accessToken} />
<nav class="my-2 flex">
	<a href="#" class="border-b-2 border-primary px-6 py-3 text-sm font-medium"> Posts </a>
	<a
		href="#"
		class="px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
	>
		Recipes
	</a>
	<a
		href="#"
		class="px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
	>
		Media
	</a>
</nav>
<CreatePost authToken={data.accessToken} />
