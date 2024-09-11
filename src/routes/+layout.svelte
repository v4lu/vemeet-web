<script lang="ts">
	import { Toast } from '$lib/components/ui/toast';

	import '@fontsource-variable/rubik';
	import { ModeWatcher } from 'mode-watcher';
	import '../app.css';
	import { toast } from '../lib/stores/toast.store';

	let { children } = $props();
</script>

{#each $toast as t (t.id)}
	<Toast message={t.message} type={t.type} />
{/each}
<ModeWatcher />
{@render children()}
