<script lang="ts">
	import { cn } from '$lib/cn';
	import { clickOutside } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import { quintOut } from 'svelte/easing';
	import { fade, slide } from 'svelte/transition';




	type Props = {
		onClose: () => void;
		class?: string;
		children: Snippet;
	};

	let { children, onClose, class: className }: Props = $props();
	let startY = 0;
	let currentY = 0;
	let drawerHeight = 0;
	let drawerElement: HTMLDivElement;

	function handleDragStart(e: TouchEvent) {
		startY = e.touches[0].clientY;
		drawerHeight = drawerElement.offsetHeight;
	}

	function handleDrag(e: TouchEvent) {
		currentY = e.touches[0].clientY;
		const dragDistance = currentY - startY;

		if (dragDistance > 0) {
			drawerElement.style.transform = `translateY(${dragDistance}px)`;
		}
	}

	function handleDragEnd() {
		const dragDistance = currentY - startY;
		const threshold = drawerHeight * 0.3;

		if (dragDistance > threshold) {
			onClose();
		} else {
			drawerElement.style.transform = 'translateY(0)';
		}
	}
</script>

<div class="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm" transition:fade={{ duration: 200 }}>
	<div
		bind:this={drawerElement}
		use:clickOutside={onClose}
		class={cn(
			'fixed bottom-0 left-0 right-0 z-[101] h-fit rounded-t-xl border-t border-border bg-card p-6 transition-transform',
			className
		)}
		transition:slide={{ duration: 300, easing: quintOut, axis: 'y' }}
	>
		<div
			class="absolute left-0 right-0 top-0 flex h-10 cursor-grab items-center justify-center"
			ontouchstart={handleDragStart}
			ontouchmove={handleDrag}
			ontouchend={handleDragEnd}
		>
			<div class="h-1.5 w-16 rounded-full bg-muted"></div>
		</div>
		<div class="mt-6">
			{@render children()}
		</div>
	</div>
</div>
