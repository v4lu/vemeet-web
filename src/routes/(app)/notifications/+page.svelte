<script lang="ts">
	import { useNotification } from '$lib/api/use-notification.svelte.js';
	import { cn } from '$lib/cn';
	import { Button } from '$lib/components/ui/button';
	import { CustomHeaderWithTitle } from '$lib/components/ui/custom-header';
	import type { NotificationType } from '$lib/types/notification.type.js';
	import Icon from '@iconify/svelte';
	import { formatDistanceToNow } from 'date-fns';

	let { data } = $props();
	const { resp, markAsRead, markAllAsRead } = useNotification(data.accessToken);

	function getNotificationIcon(type: NotificationType) {
		switch (type) {
			case 'new_follower':
				return 'solar:user-plus-rounded-bold';
			case 'new_reaction':
				return 'solar:heart-bold';
			case 'new_comment':
				return 'solar:chat-square-like-bold';
			case 'new_match':
				return 'solar:users-group-two-rounded-bold';
			default:
				return 'solar:bell-bold';
		}
	}

	function getNotificationColor(type: NotificationType) {
		switch (type) {
			case 'new_follower':
				return 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400';
			case 'new_reaction':
				return 'bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400';
			case 'new_comment':
				return 'bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400';
			case 'new_match':
				return 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400';
			default:
				return 'bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400';
		}
	}
</script>

<CustomHeaderWithTitle title="Notifications" />

<div class="mx-auto w-full max-w-pc lg:bg-card">
	<div class="container mx-auto max-w-pc pb-8 pt-4 lg:border-x lg:border-border lg:bg-card">
		<div class="w-full">
			<div class="mb-4 flex items-center justify-end">
				{#if resp.nonMessageNotification.length > 0}
					<Button
						variant="outline"
						size="sm"
						onclick={markAllAsRead}
						class="hidden hover:bg-muted/80 sm:flex"
					>
						<Icon icon="solar:check-read-bold" class="mr-2 size-4" />
						Mark all as read
					</Button>
				{/if}
			</div>

			{#if resp.isLoading}
				<div class="flex justify-center py-8">
					<Icon icon="solar:spinner-bold" class="size-8 animate-spin text-muted-foreground" />
				</div>
			{:else if resp.nonMessageNotification.length === 0}
				<div class="flex flex-col items-center justify-center py-12 text-center">
					<h3 class="mt-4 text-lg font-medium">No notifications</h3>
					<p class="mt-2 text-sm text-muted-foreground">
						You're all caught up with your notifications
					</p>
				</div>
			{:else}
				<div class="space-y-4">
					<div class="flex justify-end sm:hidden">
						<Button
							variant="outline"
							size="sm"
							onclick={markAllAsRead}
							class="w-full hover:bg-muted/80 sm:w-auto"
						>
							<Icon icon="solar:check-read-bold" class="mr-2 size-4" />
							Mark all as read
						</Button>
					</div>

					{#each resp.nonMessageNotification as notification (notification.id)}
						<div
							class="group relative flex items-start space-x-4 rounded-lg border bg-card p-4 shadow-sm transition-all hover:bg-accent/50"
						>
							<div
								class={cn(
									'flex size-10 shrink-0 items-center justify-center rounded-full transition-colors',
									getNotificationColor(notification.notificationType)
								)}
							>
								<Icon icon={getNotificationIcon(notification.notificationType)} class="size-5" />
							</div>

							<div class="min-w-0 flex-1">
								<div class="flex items-start justify-between gap-2">
									<div class="space-y-1">
										<p class="line-clamp-2 text-sm font-medium">{notification.content}</p>
										<p class="text-xs text-muted-foreground">
											{formatDistanceToNow(new Date(notification.createdAt), {
												addSuffix: true
											})}
										</p>
									</div>
									<button
										onclick={() => markAsRead(notification.id)}
										class="shrink-0 rounded-full p-1.5 text-muted-foreground/60 transition-colors hover:bg-muted hover:text-muted-foreground"
										title="Mark as read"
									>
										<Icon icon="solar:check-read-bold" class="size-4" />
									</button>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>
