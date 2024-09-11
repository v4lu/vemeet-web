<script lang="ts">
	import { Header } from '$lib/components/layout';

	let { children } = $props();
</script>

<div class="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
	<Header />
	<main class="container p-6">
		{@render children()}
	</main>
</div>
