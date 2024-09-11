<script lang="ts">
	import { Toast } from '$lib/components/ui/toast';
	import '@fontsource-variable/rubik';
	import '../app.css';
	import { toast } from '../lib/stores/toast.store';

	let { children } = $props();
</script>

{@render children()}

{#each $toast as t (t.id)}
	<Toast message={t.message} type={t.type} />
{/each}
