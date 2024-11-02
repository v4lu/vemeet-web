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

<div
	class="container min-h-full bg-background py-4 lg:border-x lg:border-border lg:bg-card lg:bg-card"
>
	<div class="space-y-6">
		<div class="space-y-2">
			<h2 class="text-xl font-semibold tracking-tight sm:text-2xl">Recent Activity</h2>
			<p class="text-sm text-muted-foreground">Stay updated with your latest notifications</p>
		</div>

		{#if resp.isLoading}
			<div class="flex h-64 items-center justify-center rounded-lg border bg-card">
				<Icon icon="solar:spinner-bold" class="size-10 animate-spin text-primary" />
			</div>
		{:else if resp.nonMessageNotification.length === 0}
			<div
				class="flex flex-col items-center justify-center rounded-lg border bg-card p-8 text-center shadow-sm"
			>
				<div class="flex size-16 items-center justify-center rounded-full bg-primary/10">
					<Icon icon="solar:bell-bold" class="size-8 text-primary" />
				</div>
				<h3 class="mt-4 text-lg font-medium">All Caught Up!</h3>
				<p class="mt-2 text-sm text-muted-foreground">
					You have no new notifications at the moment
				</p>
			</div>
		{:else}
			<div class="flex items-center justify-between">
				<span class="text-sm text-muted-foreground">
					You have {resp.nonMessageNotification.length} notification{resp.nonMessageNotification
						.length !== 1
						? 's'
						: ''}
				</span>
				<Button variant="outline" size="sm" onclick={markAllAsRead} class="hover:bg-muted/80">
					<Icon icon="solar:check-read-bold" class="mr-2 size-4" />
					Mark all as read
				</Button>
			</div>

			<div class="space-y-3">
				{#each resp.nonMessageNotification as notification (notification.id)}
					<div
						class="group relative overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:bg-accent/50"
					>
						<div class="flex items-start space-x-4 p-4">
							<div
								class={cn(
									'flex size-10 shrink-0 items-center justify-center rounded-full transition-colors',
									getNotificationColor(notification.notificationType.name)
								)}
							>
								<Icon
									icon={getNotificationIcon(notification.notificationType.name)}
									class="size-5"
								/>
							</div>

							<div class="min-w-0 flex-1">
								<div class="flex items-start justify-between gap-2">
									<div class="space-y-1">
										<p class="text-sm font-medium leading-snug">{notification.content}</p>
										<div class="flex items-center space-x-2 text-xs text-muted-foreground">
											<Icon icon="solar:clock-circle-bold" class="size-3.5" />
											<span>
												{formatDistanceToNow(new Date(notification.createdAt), {
													addSuffix: true
												})}
											</span>
										</div>
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
					</div>
				{/each}
			</div>

			<div class="rounded-lg border bg-card/50 p-4">
				<div class="flex items-start space-x-2">
					<Icon icon="solar:info-circle-bold" class="mt-1 size-5 text-muted-foreground" />
					<div class="flex-1 text-sm text-muted-foreground">
						<p>
							Notifications are automatically marked as read when you interact with them. You can
							also manually mark them as read using the check button.
						</p>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
