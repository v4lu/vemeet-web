<script lang="ts">
	import { cn } from '$lib/cn';
	import { formatTimestamp } from '$lib/date';
	import { sessionStore } from '$lib/stores/session.store';
	import type { Message } from '$lib/types/chat.types';
	import Icon from '@iconify/svelte';
	import { fly } from 'svelte/transition';
	import { AudioPlayer } from '../ui/audio-player';
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
			'group flex max-w-[85%] flex-col sm:max-w-[70%]',
			message.sender.id === $sessionStore.id ? 'items-end' : 'items-start'
		)}
	>
		<div class="space-y-1.5">
			{#if message.content}
				<div
					class={cn(
						'relative rounded-2xl px-4 py-2.5 shadow-sm',
						'transform transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-md',
						message.sender.id === $sessionStore.id
							? 'rounded-br-sm bg-primary text-primary-foreground'
							: 'rounded-bl-sm border bg-card text-card-foreground'
					)}
				>
					<p class="break-words text-[0.9375rem] leading-relaxed">
						{message.content}
					</p>
				</div>
			{/if}

			{#if message.chatAssets && message.chatAssets.length > 0}
				<div
					class={cn(
						'grid gap-1',
						message.chatAssets.length > 1 ? 'grid-cols-2' : 'grid-cols-1',
						message.chatAssets.length >= 3 ? 'max-w-sm' : 'max-w-xs'
					)}
				>
					{#each message.chatAssets as asset}
						{#if asset.fileType === 'IMAGE' && asset.fileUrl}
							<div
								class="group/image relative overflow-hidden rounded-xl border bg-muted/30"
								onclick={() => openImageModal(asset.fileUrl!)}
							>
								<img
									src={asset.fileUrl}
									alt="Chat asset"
									class="object-cover transition-transform duration-300 hover:scale-105"
								/>
							</div>
						{:else if asset.fileType === 'VIDEO'}
							<div class="relative overflow-hidden rounded-xl border bg-muted/30">
								<video src={asset.fileUrl} class="aspect-square w-full object-cover" controls
								></video>
							</div>
						{:else if asset.fileType === 'AUDIO'}
							<div class="col-span-2">
								<AudioPlayer
									senderId={message.sender.id}
									src={asset.fileUrl!}
									durationSeconds={asset.durationSeconds || 0}
								/>
							</div>
						{:else}
							<div class="col-span-2 flex items-center gap-2 rounded-xl border bg-muted/30 p-3">
								<Icon icon="solar:file-bold" class="size-5" />
								<span class="text-sm font-medium">{asset.fileType} file</span>
							</div>
						{/if}
					{/each}
				</div>
			{/if}
		</div>

		<span
			class={cn(
				'mt-1 px-1.5 text-xs text-muted-foreground/60',
				message.sender.id === $sessionStore.id ? 'text-right' : 'text-left'
			)}
		>
			{formatTimestamp(message.createdAt)}
		</span>
	</div>
</div>

{#if showImageModal}
	<ImageModal src={selectedImage} alt="Full size image" onClose={closeImageModal} />
{/if}
