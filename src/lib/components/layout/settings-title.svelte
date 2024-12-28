<script lang="ts">
	import Icon from '@iconify/svelte';

	type Props = {
		title: string;
		subtitle?: string;
		icon: string;
	};

	let { title, subtitle, icon }: Props = $props();
</script>

<div class="flex flex-col space-y-4 sm:flex-row sm:items-center sm:gap-4 sm:space-y-0">
	<div
		class="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary sm:size-16"
	>
		<Icon {icon} class="size-6 sm:size-8" />
	</div>
	<div>
		<h2 class="text-base font-semibold sm:text-lg">{title}</h2>
		{#if subtitle}
			<p class="text-sm text-muted-foreground">{subtitle}</p>
		{/if}
	</div>
</div>
