<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import Icon from '@iconify/svelte';

	type Props = {
		src: string;
		durationSeconds: number;
	};

	let { src, durationSeconds }: Props = $props();

	let audio: HTMLAudioElement;
	let isPlaying = $state(false);
	let progress = $state(0);
	let currentTime = $state(0);

	onMount(() => {
		audio = new Audio(src);
		audio.addEventListener('timeupdate', updateProgress);
		audio.addEventListener('ended', () => {
			isPlaying = false;
			progress = 0;
			currentTime = 0;
		});
	});

	onDestroy(() => {
		if (audio) {
			audio.removeEventListener('timeupdate', updateProgress);
			audio.pause();
		}
	});

	function togglePlay() {
		if (isPlaying) {
			audio.pause();
		} else {
			audio.play();
		}
		isPlaying = !isPlaying;
	}

	function updateProgress() {
		progress = (audio.currentTime / audio.duration) * 100;
		currentTime = audio.currentTime;
	}

	function seek(event: MouseEvent) {
		const progressBar = event.currentTarget as HTMLDivElement;
		const clickPosition = event.offsetX / progressBar.offsetWidth;
		audio.currentTime = clickPosition * audio.duration;
		updateProgress();
	}

	function formatTime(timeInSeconds: number): string {
		const minutes = Math.floor(timeInSeconds / 60);
		const seconds = Math.floor(timeInSeconds % 60);
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	}
</script>

<div
	class="custom-audio-player w-full min-w-[240px] max-w-[320px] overflow-hidden rounded-lg bg-muted shadow-md"
>
	<div class="flex items-center justify-between bg-primary/10 p-3">
		<button
			onclick={togglePlay}
			class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/80"
		>
			<Icon icon={isPlaying ? 'solar:pause-bold' : 'solar:play-bold'} class="size-5" />
		</button>
		<div class="text-sm font-medium">
			{formatTime(currentTime)} / {formatTime(durationSeconds)}
		</div>
	</div>
	<div class="h-2 cursor-pointer bg-muted-foreground/20" onclick={seek}>
		<div
			class="h-full bg-primary transition-all duration-100 ease-in-out"
			style="width: {progress}%"
		></div>
	</div>
</div>

<style>
	.custom-audio-player {
		font-family:
			system-ui,
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			Roboto,
			Oxygen,
			Ubuntu,
			Cantarell,
			'Open Sans',
			'Helvetica Neue',
			sans-serif;
	}
</style>
