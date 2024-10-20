<script lang="ts">
	import Icon from '@iconify/svelte';
	import { Button } from '../ui/button';
	import { Drawer } from '../ui/drawer';

	type DrawerProps = {
		onConfirm: () => void;
		onClose: () => void;
		confirmText: string;
		class?: string;
		title: string;
		desc: string;
		submitting?: boolean;
		showIcon?: boolean;
		icon?: string;
	};

	let {
		onConfirm,
		confirmText,
		onClose,
		class: className,
		title,
		desc,
		icon = 'solar:trash-bin-2-bold',
		showIcon = true,
		submitting
	}: DrawerProps = $props();
</script>

<Drawer {onClose} class={className}>
	<div class="grid gap-2">
		<h2 class="text-2xl font-semibold">{title}</h2>
		<p class="text-pretty text-sm text-muted-foreground">{desc}</p>
	</div>

	<div class="mt-4 flex w-full items-center justify-end gap-3">
		<Button onclick={onClose} variant="secondary" size="sm" class="px-4">Cancel</Button>
		<Button
			isLoading={submitting}
			disabled={submitting}
			onclick={onConfirm}
			variant="destructive"
			size="sm"
			class="px-4"
		>
			{#if !submitting && showIcon}
				<Icon {icon} class="mr-2 size-4" />
			{/if}
			{confirmText}
		</Button>
	</div>
</Drawer>
