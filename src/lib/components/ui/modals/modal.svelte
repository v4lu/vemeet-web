<script lang="ts">
	import type { Snippet } from 'svelte';
	import { quintOut } from 'svelte/easing';
	import { fade, scale } from 'svelte/transition';
	import { cn } from '$lib/cn';

	type ModalProps = {
		onClose: () => void;
		class?: string;
		parentClass?: string;
		children: Snippet;
		closable?: boolean;
	};
	let { onClose, children, parentClass, class: className, closable = true }: ModalProps = $props();

	let modalContent = $state<HTMLDivElement>();

	function handleOutsideClick(event: MouseEvent) {
		if (closable && modalContent && !modalContent.contains(event.target as Node)) {
			onClose();
		}
	}
	function handleKeydown(event: KeyboardEvent) {
		if (closable && event.key === 'Escape') {
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
	class={cn(
		'fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-2 backdrop-blur-sm',
		parentClass
	)}
	transition:fade={{ duration: 200 }}
>
	<div
		bind:this={modalContent}
		class={cn('relative rounded-md border border-border bg-card p-6', className)}
		transition:scale={{ duration: 300, easing: quintOut }}
	>
		{@render children()}
	</div>
</div>
