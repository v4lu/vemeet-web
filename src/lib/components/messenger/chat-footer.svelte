<script lang="ts">
	import Icon from '@iconify/svelte';
	import { fade, fly } from 'svelte/transition';
	import { Button } from '../ui/button';
	import { inputVariants } from '../ui/input';
	import type { ChatAssetReq, CreateMessage } from '$lib/types/chat.types';
	import { cn } from '$lib/cn';
	import { uploadFile, uploadImage } from '$lib/api';

	type Props = {
		handleSubmit: (message: Omit<CreateMessage, 'firstTime'>) => Promise<void>;
		authToken: string;
		isSubmitting: boolean;
		receipantId: number;
	};

	let { handleSubmit, receipantId, authToken, isSubmitting }: Props = $props();
	let newMessage = $state('');
	let imageUrls = $state<string[]>([]);
	let fileInput = $state<HTMLInputElement | null>(null);
	let imageUploadLoading = $state(false);

	let mediaRecorder = $state<MediaRecorder | null>(null);
	let audioChunks = $state<Blob[]>([]);
	let isRecording = $state(false);
	let permissionStatus = $state<PermissionState>('prompt');
	let errorMessage = $state('');
	let recordingDuration = $state(0);
	let recordingInterval = $state<number | null>(null);
	let isMobile = $state(false);
	let isInputFocused = $state(false);

	function handleInputFocus() {
		isInputFocused = true;
	}

	function handleInputBlur() {
		isInputFocused = false;
	}

	$effect(() => {
		checkPermission();
	});

	async function checkPermission(): Promise<void> {
		try {
			const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
			permissionStatus = result.state;
			result.onchange = () => {
				permissionStatus = result.state;
			};
		} catch (error) {
			console.error('Error checking permission:', error);
			permissionStatus = 'prompt';
		}
	}

	async function requestPermissionAndSetup(): Promise<void> {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			setupMediaRecorder(stream);
			permissionStatus = 'granted';
			errorMessage = '';
		} catch (error) {
			console.error('Error accessing microphone:', error);
			permissionStatus = 'denied';
			errorMessage = 'Microphone access denied. Please grant permission in your browser settings.';
		}
	}

	function setupMediaRecorder(stream: MediaStream): void {
		mediaRecorder = new MediaRecorder(stream);
		mediaRecorder.ondataavailable = (event: BlobEvent) => {
			audioChunks = [...audioChunks, event.data];
		};
		mediaRecorder.onstop = () => {
			uploadAudio();
		};
	}

	function startRecording(): void {
		if (permissionStatus === 'granted' && mediaRecorder) {
			audioChunks = [];
			mediaRecorder.start();
			isRecording = true;
			recordingDuration = 0;
			recordingInterval = setInterval(() => {
				recordingDuration++;
			}, 1000) as unknown as number;
		} else {
			requestPermissionAndSetup();
		}
	}

	function stopRecording(): void {
		if (mediaRecorder && isRecording) {
			mediaRecorder.stop();
			isRecording = false;
			if (recordingInterval) {
				clearInterval(recordingInterval);
				recordingInterval = null;
			}
		}
	}

	async function uploadAudio(): Promise<void> {
		try {
			const audioBlob = new Blob(audioChunks, { type: 'audio/mpeg' });
			const file = new File([audioBlob], 'audio.mp3', { type: 'audio/mpeg' });

			const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
			const arrayBuffer = await file.arrayBuffer();
			const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
			const durationSeconds = audioBuffer.duration;

			const uploadedFile = await uploadFile({ file, authToken });
			if (uploadedFile) {
				const chatAsset: ChatAssetReq = {
					assetUrl: uploadedFile.url,
					fileSize: file.size,
					fileType: 'AUDIO',
					durationSeconds: Math.round(durationSeconds),
					mimeType: file.type
				};
				const messageData: Omit<CreateMessage, 'firstTime'> = {
					recipientId: receipantId,
					messageType: 'AUDIO',
					content: null,
					isOneTime: false,
					chatAssets: [chatAsset]
				};
				await handleSubmit(messageData);
			}
		} catch (error) {
			console.error('Error uploading audio:', error);
			errorMessage = 'Failed to upload audio. Please try again.';
		}
	}

	function handleInputFileClick(): void {
		if (!fileInput) return;
		fileInput.click();
	}

	async function handleImageUpload(event: Event): Promise<void> {
		const input = event.target as HTMLInputElement;
		if (input.files?.length) {
			const totalImages = imageUrls.length + input.files.length;
			if (totalImages <= 5) {
				imageUploadLoading = true;
				try {
					await Promise.all(
						Array.from(input.files).map(async (file) => {
							await uploadImage({
								authToken,
								file,
								setImageUploadLoading: () => (imageUploadLoading = true),
								setImageUrl: (img) => (imageUrls = [...imageUrls, img])
							});
						})
					);
				} catch (error) {
					console.error('Error uploading images:', error);
				} finally {
					imageUploadLoading = false;
				}
			} else {
				errorMessage = 'You can upload a maximum of 5 images.';
			}
		}
	}

	function deleteImage(index: number): void {
		imageUrls = imageUrls.filter((_, i) => i !== index);
	}

	async function onSubmit(event: Event) {
		event.preventDefault();
		if (newMessage.trim().length === 0 && imageUrls.length === 0) return;

		const chatAssets: ChatAssetReq[] = imageUrls.map((url) => ({
			assetUrl: url,
			fileSize: 0,
			fileType: 'IMAGE',
			durationSeconds: 0,
			mimeType: '.png'
		}));

		const messageData: Omit<CreateMessage, 'firstTime'> = {
			recipientId: receipantId,
			messageType: chatAssets.length > 0 ? 'IMAGE' : 'TEXT',
			content: newMessage,
			isOneTime: false,
			chatAssets: chatAssets.length > 0 ? chatAssets : undefined
		};

		await handleSubmit(messageData);
		newMessage = '';
		imageUrls = [];
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			onSubmit(event);
		}
	}

	function formatDuration(seconds: number): string {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes > 0 ? `${minutes}m ` : ''}${remainingSeconds}s`;
	}

	$effect(() => {
		const mediaQuery = window.matchMedia('(max-width: 768px)');

		function handleResize(e: MediaQueryListEvent | MediaQueryList) {
			isMobile = e.matches;
		}

		mediaQuery.addEventListener('change', handleResize);

		handleResize(mediaQuery);

		return () => {
			mediaQuery.removeEventListener('change', handleResize);
		};
	});
</script>

<div class="container fixed bottom-0 left-0 right-0 border-t border-border bg-card shadow-lg">
	<div class="container mx-auto py-3">
		<form onsubmit={onSubmit} class="flex flex-col items-center justify-center gap-4">
			{#if imageUrls.length > 0}
				<div class="flex flex-wrap gap-2 pb-3">
					{#each imageUrls as imageUrl, i}
						<div class="relative h-20 w-20 overflow-hidden rounded-lg shadow-md">
							<img
								src={imageUrl}
								alt="Uploaded file"
								class="h-full w-full object-cover object-center transition-transform duration-300 hover:scale-110"
							/>
							<button
								onclick={() => deleteImage(i)}
								class="absolute right-1 top-1 rounded-full bg-black bg-opacity-50 p-1 text-white transition-colors hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-primary"
								aria-label="Delete image"
								type="button"
							>
								<Icon icon="solar:close-circle-bold" class="size-4" />
							</button>
						</div>
					{/each}
				</div>
			{/if}
			<div class="relative flex w-full items-center gap-3">
				<div class="relative flex-grow">
					<textarea
						onkeydown={handleKeyDown}
						onfocus={handleInputFocus}
						onblur={handleInputBlur}
						class={cn(
							inputVariants({ variant: 'empty' }),
							'h-full max-h-[3rem] w-full resize-none rounded-3xl py-3 pr-4',
							'bg-muted/50 text-foreground placeholder:text-muted-foreground/50',
							'border-2 border-transparent transition-all duration-300 ease-in-out',
							'focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary'
						)}
						placeholder="Type a message..."
						bind:value={newMessage}
					></textarea>
				</div>

				{#if !isInputFocused}
					<div class="flex items-center gap-2" transition:fade={{ duration: 200 }}>
						<Button
							disabled={imageUploadLoading || imageUrls.length >= 5}
							onclick={handleInputFileClick}
							variant="ghost"
							size="icon-sm"
							class="text-muted-foreground hover:bg-primary hover:text-white focus:ring-2 focus:ring-primary"
							type="button"
						>
							<Icon icon="solar:gallery-add-bold" class="size-5" />
						</Button>
						<input
							bind:this={fileInput}
							type="file"
							multiple={true}
							class="hidden"
							onchange={handleImageUpload}
							accept="image/*"
						/>
						<Button
							onmousedown={isMobile ? undefined : startRecording}
							onmouseup={isMobile ? undefined : stopRecording}
							ontouchstart={isMobile ? startRecording : undefined}
							ontouchend={isMobile ? stopRecording : undefined}
							variant="ghost"
							size="icon-sm"
							class={cn(
								'transition-all duration-200 focus:ring-2 focus:ring-primary',
								isRecording
									? 'animate-pulse bg-red-500 text-white'
									: 'hover:bg-primary hover:text-white'
							)}
							type="button"
						>
							{#if isRecording}
								<div class="flex items-center">
									<Icon icon="eos-icons:loading" class="mr-1 size-4 animate-spin" />
									<span class="text-xs font-medium">{formatDuration(recordingDuration)}</span>
								</div>
							{:else}
								<Icon icon="solar:microphone-bold" class="size-5" />
							{/if}
						</Button>
					</div>
				{/if}

				{#if newMessage.trim().length > 0 || imageUrls.length > 0}
					<div in:fly={{ x: 20, duration: 300 }} out:fade={{ duration: 200 }}>
						<Button
							disabled={isSubmitting}
							type="submit"
							size="icon"
							class="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-2 focus:ring-primary"
						>
							{#if !isSubmitting}
								<Icon icon="solar:plain-bold" class="size-5" />
							{:else}
								<Icon icon="eos-icons:loading" class="size-5 animate-spin" />
							{/if}
						</Button>
					</div>
				{/if}
			</div>
		</form>
		{#if errorMessage}
			<p class="error mt-2 text-sm text-red-500">{errorMessage}</p>
		{/if}
	</div>
</div>
