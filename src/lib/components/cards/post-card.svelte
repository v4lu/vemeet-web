<script lang="ts">
	import type { Post } from '$lib/types/post.types';
	import Icon from '@iconify/svelte';
	import { formatDistanceToNow } from 'date-fns';
	import { Dropdown } from '../ui/dropdown';

	type PostCardProps = {
		post: Post;
	};

	let { post }: PostCardProps = $props();
	let isSettingsOpen = $state(false);

	function formatTimestamp(timestamp: string): string {
		return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
	}

	function handleDelete() {
		isSettingsOpen = false;
	}

	function handleUpdate() {
		isSettingsOpen = false;
	}
</script>

<div
	class="mb-4 overflow-hidden rounded-lg border border-border bg-card shadow transition-shadow hover:shadow-md"
>
	<div class="relative">
		<div class="absolute right-2 top-2 z-10">
			<Dropdown
				triggerIcon="solar:menu-dots-bold"
				bind:isOpen={isSettingsOpen}
				triggerClass="size-6 flex min-w-0 p-0 justify-center"
				triggerIconClass="m-0 p-0"
				class="right-0 top-8"
			>
				<div class="flex w-full flex-col gap-1">
					<button
						class="flex w-full items-center rounded-sm px-2 py-1 text-sm text-destructive transition-colors hover:bg-destructive/10"
						onclick={handleDelete}
					>
						<Icon icon="lucide:trash-2" class="mr-2" />
						Delete
					</button>
					<button
						class="flex w-full items-center rounded-sm px-2 py-1 text-sm transition-colors hover:bg-accent"
						onclick={handleUpdate}
					>
						<Icon icon="lucide:pencil" class="mr-2" />
						Edit
					</button>
				</div>
			</Dropdown>
		</div>
		<div class="relative mb-4 flex items-center justify-between px-4 pt-4">
			<div class="flex items-center">
				<img
					src={post.user.profileImage ? post.user.profileImage.url : '/placeholder-user.webp'}
					alt={post.user.username}
					class="mr-3 h-10 w-10 rounded-full object-cover"
				/>
				<div>
					<h3 class="font-semibold text-foreground">{post.user.username}</h3>
					<p class="text-xs text-muted-foreground">{formatTimestamp(post.createdAt)}</p>
				</div>
			</div>
		</div>
		<p class="mb-4 px-4 text-foreground">{post.content}</p>
		<div class="flex items-center justify-between border-t border-border p-4 pt-3">
			<button
				class="flex items-center text-sm text-muted-foreground transition-colors hover:text-primary"
			>
				<Icon icon="lucide:heart" class="mr-1.5" />
				<span>Like</span>
			</button>
			<button
				class="flex items-center text-sm text-muted-foreground transition-colors hover:text-primary"
			>
				<Icon icon="lucide:message-circle" class="mr-1.5" />
				<span>Comment</span>
			</button>
			<button
				class="flex items-center text-sm text-muted-foreground transition-colors hover:text-primary"
			>
				<Icon icon="lucide:share" class="mr-1.5" />
				<span>Share</span>
			</button>
		</div>
	</div>
</div>
