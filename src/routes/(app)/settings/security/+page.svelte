<script lang="ts">
	import Icon from '@iconify/svelte';
</script>

<div class="container mx-auto mt-12 max-w-2xl space-y-6">
	<button
		class="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
		onclick={() => history.back()}
	>
		<Icon icon="solar:arrow-left-linear" class="mr-2 size-5" />
		Back
	</button>
	<div class="container mx-auto mt-12 max-w-2xl rounded-xl bg-card p-6 shadow-lg">
		<h1 class="mb-6 text-2xl font-bold text-foreground">Privacy</h1>
	</div>
</div>
