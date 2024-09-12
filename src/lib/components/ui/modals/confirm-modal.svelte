<script lang="ts">
	import { cn } from '$lib/cn';
	import Icon from '@iconify/svelte';
	import { quintOut } from 'svelte/easing';
	import { fade, scale } from 'svelte/transition';
	import { Button } from '../button';

	type ConfirmModalProps = {
		onConfirm: () => void;
		onClose: () => void;
		confirmText: string;
		class?: string;
		title: string;
		desc: string;
		submitting?: boolean;
	};
	let {
		onConfirm,
		confirmText,
		onClose,
		class: className,
		title,
		desc,
		submitting
	}: ConfirmModalProps = $props();

	let modalContent = $state<HTMLDivElement>();

	function handleOutsideClick(event: MouseEvent) {
		if (modalContent && !modalContent.contains(event.target as Node)) {
			onClose();
		}
	}
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			onClose();
		}
	}

	$effect(() => {
		document.addEventListener('mousedown', handleOutsideClick);
		document.addEventListener('keydown', handleKeydown);
		return () => {
			document.removeEventListener('mousedown', handleOutsideClick);
			document.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<div
	class="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm"
	transition:fade={{ duration: 200 }}
>
	<div
		bind:this={modalContent}
		class={cn('relative rounded-md border border-border bg-card p-6', className)}
		transition:scale={{ duration: 300, easing: quintOut }}
	>
		<div class="grid gap-2">
			<h2 class="text-2xl font-semibold">{title}</h2>
			<p class="text-pretty text-sm text-muted-foreground">{desc}</p>
		</div>
		<div class="mt-4 flex w-full items-center justify-end gap-3">
			<Button onclick={onClose} variant="secondary" size="sm">
				<Icon icon="solar:trash-bin-2-bold" class="mr-2 size-4" />
				Cancel</Button
			>
			<Button
				isLoading={submitting}
				disabled={submitting}
				onclick={onConfirm}
				variant="destructive"
				size="sm"
			>
				{#if !submitting}
					<Icon icon="solar:trash-bin-2-bold" class="mr-2 size-4" />
				{/if}
				{confirmText}</Button
			>
		</div>
	</div>
</div>
