<script lang="ts">
	import { onMount } from 'svelte';
	import Cropper from 'cropperjs';
	import 'cropperjs/dist/cropper.css';
	import Icon from '@iconify/svelte';
	import { Drawer } from '../ui/drawer';
	import { Button } from '$lib/components/ui/button';
	import { browser } from '$app/environment';

	type Props = {
		imageUrl: string;
		aspectRatio?: number;
		onClose: () => void;
		onCrop: (croppedBlob: Blob) => void;
	};

	let cropper = $state<Cropper | null>(null);
	let imageElement = $state<HTMLImageElement | null>(null);
	let isLoading = $state(false);

	let { imageUrl, aspectRatio, onClose, onCrop }: Props = $props();

	onMount(() => {
		if (imageElement && browser) {
			cropper = new Cropper(imageElement, {
				aspectRatio,
				viewMode: 2, // Changed to viewMode 2 for better visibility
				dragMode: 'move',
				autoCropArea: 1,
				restore: false,
				modal: true,
				guides: true,
				highlight: true,
				cropBoxMovable: true,
				cropBoxResizable: true,
				toggleDragModeOnDblclick: false,
				background: true,
				ready() {
					const containerData = cropper && cropper.getContainerData();
					if (window.innerWidth < 768 && cropper && containerData) {
						const cropBoxWidth = Math.min(containerData.width, 600);
						const cropBoxHeight = (cropBoxWidth * 3) / 4;
						cropper?.setCropBoxData({
							width: cropBoxWidth,
							height: cropBoxHeight
						});
					} else if (containerData && cropper) {
						const cropBoxWidth = Math.min(containerData.width, 912);
						const cropBoxHeight = (cropBoxWidth * 400) / 912;
						cropper.setCropBoxData({
							width: cropBoxWidth,
							height: cropBoxHeight
						});
					}
				}
			});
		}

		return () => {
			if (cropper) {
				cropper.destroy();
			}
		};
	});

	async function handleCrop() {
		if (!cropper) return;
		isLoading = true;

		try {
			const isMobile = window.innerWidth < 768;
			const dimensions = isMobile ? { width: 600, height: 450 } : { width: 912, height: 400 };

			const canvas = cropper.getCroppedCanvas({
				...dimensions,
				fillColor: '#fff',
				imageSmoothingEnabled: true,
				imageSmoothingQuality: 'high'
			});

			canvas.toBlob(
				(blob) => {
					if (blob) {
						onCrop(blob);
						onClose();
					}
				},
				'image/jpeg',
				0.92
			);
		} catch (error) {
			console.error('Error cropping image:', error);
		} finally {
			isLoading = false;
		}
	}

	function rotateImage() {
		cropper?.rotate(90);
	}

	function flipHorizontal() {
		cropper?.scaleX(cropper.getData().scaleX === 1 ? -1 : 1);
	}

	function flipVertical() {
		cropper?.scaleY(cropper.getData().scaleY === 1 ? -1 : 1);
	}

	function resetCropper() {
		cropper?.reset();
	}
</script>

<Drawer {onClose}>
	<div class="flex flex-col gap-6">
		<div class="flex items-center justify-center gap-2">
			<Button
				variant="outline"
				size="icon"
				onclick={rotateImage}
				title="Rotate 90 degrees"
				class="rounded-full"
			>
				<Icon icon="solar:restart-bold" class="size-4" />
			</Button>
			<Button
				variant="outline"
				size="icon"
				onclick={flipHorizontal}
				title="Flip horizontal"
				class="rounded-full"
			>
				<Icon icon="solar:flip-horizontal-bold" class="size-4" />
			</Button>
			<Button
				variant="outline"
				size="icon"
				onclick={flipVertical}
				title="Flip vertical"
				class="rounded-full"
			>
				<Icon icon="solar:flip-vertical-bold" class="size-4" />
			</Button>
			<Button
				variant="outline"
				size="icon"
				onclick={resetCropper}
				title="Reset"
				class="rounded-full"
			>
				<Icon icon="solar:refresh-circle-bold" class="size-4" />
			</Button>
		</div>

		<div class="relative h-[450px] w-full overflow-hidden rounded-lg bg-muted/30">
			<img bind:this={imageElement} src={imageUrl} alt="Crop" class="max-h-full max-w-full" />
		</div>

		<div class="flex flex-col gap-3">
			<p class="text-sm text-muted-foreground">
				Drag to reposition • Resize using the corners • Use tools above to adjust
			</p>
			<div class="flex justify-end gap-2">
				<Button variant="outline" onclick={onClose} disabled={isLoading}>Cancel</Button>
				<Button onclick={handleCrop} disabled={isLoading}>
					{#if isLoading}
						<Icon icon="solar:spinner-bold" class="mr-2 size-4 animate-spin" />
						Processing...
					{:else}
						<Icon icon="solar:check-circle-bold" class="mr-2 size-4" />
						Apply & Upload
					{/if}
				</Button>
			</div>
		</div>
	</div>
</Drawer>

<style>
	:global(.cropper-container) {
		max-width: 100%;
	}

	:global(.cropper-view-box),
	:global(.cropper-face) {
		border-color: hsl(var(--primary));
	}

	:global(.cropper-point) {
		background-color: hsl(var(--primary));
		opacity: 1;
	}

	:global(.cropper-point.point-n),
	:global(.cropper-point.point-s),
	:global(.cropper-point.point-w),
	:global(.cropper-point.point-e) {
		display: none;
	}

	:global(.cropper-line) {
		background-color: hsl(var(--primary));
	}

	:global(.cropper-view-box) {
		outline: 2px solid hsl(var(--primary));
		outline-color: hsl(var(--primary) / 0.75);
	}

	:global(.cropper-modal) {
		background-color: hsl(var(--muted) / 0.75);
	}
</style>
