<script lang="ts">
	import { cn } from '$lib/cn';
	import { sessionStore } from '$lib/stores/session.store';
	import Icon from '@iconify/svelte';
	import { onDestroy, onMount } from 'svelte';

	type Props = {
		src: string;
		durationSeconds: number;
		senderId: number;
	};

	let { src, durationSeconds, senderId }: Props = $props();
	const isOwn = senderId === $sessionStore.id;

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
	class={cn(
		'group relative w-full min-w-[240px] max-w-[320px] overflow-hidden rounded-xl shadow-sm transition-all hover:shadow-md',
		isOwn ? 'bg-primary text-primary-foreground' : 'border bg-card text-card-foreground'
	)}
>
	<div class="flex items-center gap-3 p-3">
		<button
			onclick={togglePlay}
			class={cn(
				'relative flex size-10 items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95',
				isOwn
					? 'bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20'
					: 'bg-primary text-primary-foreground hover:bg-primary/90'
			)}
		>
			<div
				class={cn(
					'absolute inset-0 rounded-full',
					isOwn ? 'bg-primary-foreground/5' : 'bg-primary/10',
					isPlaying && 'animate-ping'
				)}
			></div>
			<Icon
				icon={isPlaying ? 'solar:pause-bold' : 'solar:play-bold'}
				class={cn(
					'size-5 transition-transform',
					isPlaying ? 'scale-90' : 'translate-x-[1px] scale-100'
				)}
			/>
		</button>

		<div class="flex-1 space-y-2">
			<div
				class={cn(
					'relative h-3 cursor-pointer overflow-hidden rounded-full transition-all hover:h-4',
					isOwn ? 'bg-primary-foreground/20' : 'bg-muted'
				)}
				onclick={seek}
			>
				<div class="absolute inset-0 opacity-10">
					{#each Array(20) as _, i}
						<div
							class={cn(
								'absolute bottom-0 w-1',
								isOwn ? 'bg-primary-foreground/50' : 'bg-foreground/50'
							)}
							style="
                height: {30 + Math.sin(i * 0.5) * 20}%;
                left: {i * 5}%;
              "
						></div>
					{/each}
				</div>

				<div
					class={cn(
						'absolute inset-y-0 left-0 transition-all duration-100 ease-out',
						isOwn ? 'bg-primary-foreground' : 'bg-primary'
					)}
					style="width: {progress}%"
				>
					<div class="h-full w-full opacity-20">
						{#each Array(20) as _, i}
							<div
								class="absolute bottom-0 w-1 bg-card"
								style="
                  height: {30 + Math.sin(i * 0.5) * 20}%;
                  left: {i * 5}%;
                "
							></div>
						{/each}
					</div>
				</div>

				<div
					class={cn(
						'absolute top-1/2 size-3 -translate-y-1/2 rounded-full shadow-sm transition-transform',
						isOwn ? 'bg-primary-foreground' : 'bg-primary'
					)}
					style="left: calc({progress}% - 6px);"
				></div>
			</div>

			<div
				class={cn(
					'flex justify-between text-xs font-medium',
					isOwn ? 'text-primary-foreground/60' : 'text-muted-foreground'
				)}
			>
				<span>{formatTime(currentTime)}</span>
				<span>{formatTime(durationSeconds)}</span>
			</div>
		</div>
	</div>

	<div
		class={cn(
			'absolute inset-x-0 -bottom-px h-1 bg-gradient-to-r opacity-0 transition-opacity group-hover:opacity-100',
			isOwn
				? 'from-primary-foreground/0 via-primary-foreground to-primary-foreground/0'
				: 'from-primary/0 via-primary to-primary/0'
		)}
	></div>
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
