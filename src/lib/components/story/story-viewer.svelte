<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import type { UserStoriesResponse } from '$lib/types/story.types';
	import Icon from '@iconify/svelte';
	import { Avatar } from '../ui/avatar';
	import { fade, fly, scale } from 'svelte/transition';
	import { cubicOut, elasticOut } from 'svelte/easing';
	import { buttonVariants } from '../ui/button';
	import { cn } from '$lib/cn';

	type Props = {
		allStories: UserStoriesResponse[];
		initialUserIndex: number;
		initialStoryIndex: number;
		onClose: () => void;
	};

	let { allStories, initialUserIndex, initialStoryIndex, onClose }: Props = $props();

	let currentUserIndex = $state(initialUserIndex);
	let currentStoryIndex = $state(initialStoryIndex);
	let progress = $state(0);
	let interval = $state<number | null>(null);
	let currentUserStories = $derived(allStories[currentUserIndex]);
	let currentStory = $derived(currentUserStories?.userStories[currentStoryIndex]);

	function nextStory() {
		if (currentStoryIndex < currentUserStories.userStories.length - 1) {
			currentStoryIndex++;
		} else {
			nextUser();
		}
		startProgress();
	}

	function prevStory() {
		if (currentStoryIndex > 0) {
			currentStoryIndex--;
		} else {
			prevUser();
		}
		startProgress();
	}

	function nextUser() {
		if (currentUserIndex < allStories.length - 1) {
			currentUserIndex++;
			currentStoryIndex = 0;
			startProgress();
		} else {
			onClose();
		}
	}

	function prevUser() {
		if (currentUserIndex > 0) {
			currentUserIndex--;
			currentStoryIndex = allStories[currentUserIndex].userStories.length - 1;
			startProgress();
		}
	}

	function startProgress() {
		if (interval) clearInterval(interval);
		progress = 0;
		interval = setInterval(() => {
			progress += 1;
			if (progress >= 100) {
				nextStory();
			}
		}, 50);
	}

	onMount(() => {
		startProgress();
	});

	onDestroy(() => {
		if (interval) clearInterval(interval);
	});

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowLeft') prevStory();
		if (event.key === 'ArrowRight') nextStory();
		if (event.key === 'Escape') onClose();
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<div
	class="fixed inset-0 -left-4 z-[101] flex items-center justify-center overflow-hidden bg-black/90 backdrop-blur-sm"
	transition:fade={{ duration: 300 }}
>
	<div class="absolute inset-0 z-[102] mx-auto max-w-md">
		<button
			class={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'absolute right-4 top-8 ')}
			onclick={onClose}
		>
			<Icon icon="lucide:x" class="size-6" />
		</button>
	</div>
	<div class="relative h-full w-full max-w-md overflow-hidden">
		{#if currentStory && currentUserStories}
			<img
				src={currentStory.asset?.url}
				alt="Story"
				class="h-full w-full object-cover"
				in:fade={{
					duration: 300
				}}
			/>

			<div class="absolute left-0 right-0 top-0 flex p-2" in:fly={{ y: -20, duration: 300 }}>
				{#each currentUserStories.userStories as _, index}
					<div class="mr-1 h-1 flex-1 overflow-hidden rounded-full bg-white/30">
						<div
							class="h-full rounded-full bg-primary transition-all duration-300 ease-out"
							style="width: {index < currentStoryIndex
								? '100%'
								: index === currentStoryIndex
									? `${progress}%`
									: '0%'}"
							transition:scale={{ duration: 300, easing: cubicOut }}
						></div>
					</div>
				{/each}
			</div>

			<div class="absolute left-0 right-0 top-0 flex items-center justify-between p-8">
				<div class="flex items-center rounded-full bg-black/50 p-1 pr-3">
					<Avatar user={currentUserStories.user} class="border-2 border-white" />
					<span class="ml-2 font-semibold text-white">{currentUserStories.user.username}</span>
				</div>
			</div>

			<div class="absolute inset-y-0 left-0 w-1/2" onclick={prevStory}></div>
			<div class="absolute inset-y-0 right-0 w-1/2" onclick={nextStory}></div>
			<button
				class={cn(
					buttonVariants({ variant: 'ghost', size: 'icon' }),
					'absolute left-4 top-1/2 z-[103] -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 hover:text-white'
				)}
				onclick={prevStory}
				in:scale={{ duration: 300, easing: elasticOut }}
			>
				<Icon icon="solar:alt-arrow-left-line-duotone" class="size-8" />
			</button>
			<button
				class={cn(
					buttonVariants({ variant: 'ghost', size: 'icon' }),
					'absolute right-4 top-1/2 z-[103] -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 hover:text-white'
				)}
				onclick={nextStory}
				in:scale={{ duration: 300, easing: elasticOut }}
			>
				<Icon icon="solar:alt-arrow-right-line-duotone" class="size-8" />
			</button>
		{:else}
			<div class="flex h-full items-center justify-center text-white" in:fade>
				No more stories to show
			</div>
		{/if}
	</div>
</div>
