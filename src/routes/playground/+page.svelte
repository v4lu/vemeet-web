<script lang="ts">
	import { onMount } from 'svelte';

	let mediaRecorder: MediaRecorder | null = null;
	let audioChunks: Blob[] = [];
	let audioUrl: string = '';
	let isRecording: boolean = false;
	let permissionStatus: PermissionState = 'prompt';
	let errorMessage: string = '';
	let audioElement: HTMLAudioElement | null = null;

	onMount(() => {
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
			audioChunks.push(event.data);
		};

		mediaRecorder.onstop = () => {
			const audioBlob = new Blob(audioChunks, { type: 'audio/mpeg' });
			audioUrl = URL.createObjectURL(audioBlob);
			audioChunks = [];
		};
	}

	function toggleRecording(): void {
		if (permissionStatus === 'granted' && mediaRecorder) {
			if (isRecording) {
				mediaRecorder.stop();
				isRecording = false;
			} else {
				audioChunks = [];
				mediaRecorder.start();
				isRecording = true;
			}
		} else {
			requestPermissionAndSetup();
		}
	}

	function handlePlayback(): void {
		if (audioElement) {
			audioElement.play().catch((error) => {
				console.error('Playback error:', error);
				errorMessage = 'Error playing audio. Please try again.';
			});
		}
	}

	function handleAudioLoad(): void {
		errorMessage = '';
	}
</script>

<button on:click={toggleRecording}>
	{#if permissionStatus === 'prompt'}
		Request Microphone Access
	{:else if isRecording}
		Stop Recording
	{:else}
		Start Recording
	{/if}
</button>

{#if permissionStatus === 'denied'}
	<p class="error">
		Microphone access denied. Please grant permission in your browser settings and reload the page.
	</p>
{/if}

{#if errorMessage}
	<p class="error">{errorMessage}</p>
{/if}

{#if audioUrl}
	<audio
		bind:this={audioElement}
		controls
		src={audioUrl}
		on:play={handlePlayback}
		on:loadedmetadata={handleAudioLoad}
	></audio>
	<button on:click={handlePlayback}>Play Recording</button>
{/if}

<style>
	button {
		padding: 10px 20px;
		font-size: 16px;
		background-color: #4caf50;
		color: white;
		border: none;
		border-radius: 5px;
		cursor: pointer;
		margin-right: 10px;
	}

	button:hover {
		background-color: #45a049;
	}

	audio {
		margin-top: 20px;
		width: 100%;
	}

	.error {
		color: red;
		margin-top: 10px;
	}
</style>
