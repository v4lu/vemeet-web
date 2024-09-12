<script lang="ts">
	import Icon from '@iconify/svelte';
	import { quintOut } from 'svelte/easing';
	import { fade, scale } from 'svelte/transition';

	type ImageModalProps = {
		src: string;
		alt: string;
		onClose: () => void;
	};
	let { src, alt, onClose }: ImageModalProps = $props();

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
	class="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
	transition:fade={{ duration: 200 }}
>
	<div
		bind:this={modalContent}
		class="relative max-h-[90vh] max-w-[90vw]"
		transition:scale={{ duration: 300, easing: quintOut }}
	>
		<img {src} {alt} class="max-h-[90vh] max-w-[90vw] rounded-lg object-contain" />
	</div>
	<span id="modal-title" class="sr-only">Image Modal</span>
	<button
		class="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white transition-opacity hover:opacity-80"
		onclick={onClose}
		aria-label="Close modal"
	>
		<Icon icon="iconamoon:close-bold" class="size-4" />
	</button>
</div>
