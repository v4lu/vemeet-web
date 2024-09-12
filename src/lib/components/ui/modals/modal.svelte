<script lang="ts">
	import { cn } from '$lib/cn';
	import type { Snippet } from 'svelte';
	import { quintOut } from 'svelte/easing';
	import { fade, scale } from 'svelte/transition';

	type ModalProps = {
		onClose: () => void;
		class?: string;
		children: Snippet;
	};
	let { onClose, children, class: className }: ModalProps = $props();

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
	class="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-12 backdrop-blur-sm"
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
