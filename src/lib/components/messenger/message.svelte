<script lang="ts">
	import { cn } from '$lib/cn';
	import { formatTimestamp } from '$lib/date';
	import { sessionStore } from '$lib/stores/session.store';
	import type { Message } from '$lib/types/chat.types';
	import { fly } from 'svelte/transition';
	import Icon from '@iconify/svelte';
	import { ImageModal } from '../ui/modals';

	type Props = {
		message: Message;
	};

	let { message }: Props = $props();
	let showImageModal = $state(false);
	let selectedImage = $state('');

	function openImageModal(src: string) {
		selectedImage = src;
		showImageModal = true;
	}

	function closeImageModal() {
		showImageModal = false;
		selectedImage = '';
	}
</script>

<div
	class={cn('mb-4 flex', message.sender.id === $sessionStore.id ? 'justify-end' : 'justify-start')}
	in:fly={{ y: message.sender.id === $sessionStore.id ? 50 : -50, duration: 300 }}
	out:fly={{ y: message.sender.id === $sessionStore.id ? 50 : -50, duration: 300 }}
>
	<div
		class={cn(
			'flex max-w-[70%] flex-col',
			message.sender.id === $sessionStore.id ? 'items-end' : 'items-start'
		)}
	>
		{#if message.content}
			<div
				class={cn(
					'rounded-2xl p-3 shadow-md transition-all duration-200 hover:shadow-lg',
					message.sender.id === $sessionStore.id
						? 'bg-primary text-primary-foreground'
						: 'bg-accent text-accent-foreground'
				)}
			>
				<p class="max-w-[18rem] text-balance break-words text-sm">{message.content}</p>
			</div>
		{/if}

		{#if message.chatAssets && message.chatAssets.length > 0}
			<div class="mt-2 flex flex-wrap gap-2">
				{#each message.chatAssets as asset}
					{#if asset.fileType === 'IMAGE' && asset.fileUrl}
						<div
							class="relative size-40 cursor-pointer overflow-hidden rounded-lg"
							onclick={() => openImageModal(asset.fileUrl!)}
						>
							<img
								src={asset.fileUrl}
								alt="Chat asset"
								class="h-full w-full object-cover object-center transition-transform duration-300 hover:scale-110"
							/>
						</div>
					{:else if asset.fileType === 'VIDEO'}
						<div class="relative h-24 w-24 overflow-hidden rounded-lg">
							<video src={asset.fileUrl} class="h-full w-full object-cover" controls></video>
						</div>
					{:else if asset.fileType === 'AUDIO'}
						<div class="w-full max-w-[18rem]">
							<audio src={asset.fileUrl} controls class="w-full"></audio>
						</div>
					{:else}
						<div class="flex items-center gap-2 rounded-lg bg-muted p-2">
							<Icon icon="solar:file-bold" class="size-5" />
							<span class="text-sm">{asset.fileType} file</span>
						</div>
					{/if}
				{/each}
			</div>
		{/if}

		<span class="mt-1 text-xs text-muted-foreground">
			{formatTimestamp(message.createdAt)}
		</span>
	</div>
</div>

{#if showImageModal}
	<ImageModal src={selectedImage} alt="Full size image" onClose={closeImageModal} />
{/if}
