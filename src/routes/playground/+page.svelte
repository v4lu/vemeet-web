<script>
	import { onMount } from 'svelte';

	let mediaRecorder;
	let audioChunks = [];
	let audioUrl = '';
	let isRecording = false;
	let permissionStatus = 'prompt'; // 'prompt', 'granted', 'denied'
	let errorMessage = '';

	onMount(() => {
		checkPermission();
	});

	async function checkPermission() {
		try {
			const result = await navigator.permissions.query({ name: 'microphone' });
			permissionStatus = result.state;
			result.onchange = () => {
				permissionStatus = result.state;
			};
		} catch (error) {
			console.error('Error checking permission:', error);
			permissionStatus = 'prompt';
		}
	}

	async function requestPermissionAndSetup() {
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

	function setupMediaRecorder(stream) {
		mediaRecorder = new MediaRecorder(stream);

		mediaRecorder.ondataavailable = (event) => {
			audioChunks.push(event.data);
		};

		mediaRecorder.onstop = () => {
			const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
			audioUrl = URL.createObjectURL(audioBlob);
			audioChunks = [];
		};
	}

	function toggleRecording() {
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
	<audio controls src={audioUrl}></audio>
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
