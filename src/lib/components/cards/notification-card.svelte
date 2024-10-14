<script lang="ts">
	import { type Notification } from '$lib/types/notification.type';
	import { formatTimestamp } from '$lib/date';
	import { Avatar } from '../ui/avatar';

	type Props = {
		notification: Notification;
	};

	let { notification }: Props = $props();
</script>

<div class="mb-2 rounded-lg border border-border p-3 hover:bg-accent">
	<div class="flex items-center gap-3">
		<Avatar user={notification.user} class="size-10" />
		<div class="flex-1">
			<p class="text-sm font-medium">{notification.content}</p>
			<p class="text-xs text-muted-foreground">
				{formatTimestamp(notification.createdAt)}
			</p>
		</div>
	</div>
</div>
