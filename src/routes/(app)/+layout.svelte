<script lang="ts">
	import { Header } from '$lib/components/layout';
	import { sessionStore } from '$lib/stores/session.store.js';

	let { children, data } = $props();
	sessionStore.setUser(data.user);
</script>

<div
	class="flex min-h-dvh flex-1 flex-col bg-gradient-to-r from-primary/10 via-primary/5 to-transparent"
>
	<Header />
	<main class="container mt-[56px] flex-1 p-4 py-6">
		{@render children()}
	</main>
</div>
