<script lang="ts">
	import { Header, Island } from '$lib/components/layout';
	import { sessionStore } from '$lib/stores/session.store.js';

	let { children, data } = $props();
	sessionStore.setUser(data.user);
</script>

<div
	class="flex min-h-dvh flex-1 flex-col bg-gradient-to-r from-primary/10 via-primary/5 to-transparent"
>
	<Header pathname={data.path} />
	<main class="container mb-10 mt-14 flex-1 px-4 pb-4">
		{@render children()}
	</main>
	<Island pathname={data.path} />
</div>
