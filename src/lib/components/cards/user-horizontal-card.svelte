<script lang="ts">
	import { cn } from '$lib/cn';
	import type { User } from '$lib/types/user.types';
	import { Avatar } from '../ui/avatar';

	type UserHorizontalCardProps = {
		user: User;
		class?: string;
		notRounded?: boolean;
	};

	let { user, notRounded = false, class: className }: UserHorizontalCardProps = $props();
</script>

<a
	href={`/profile/${user.id}`}
	class={cn(
		'flex items-center gap-3 p-3 hover:bg-muted/50',
		!notRounded && 'rounded-lg',
		className
	)}
>
	<Avatar {user} class="size-10" />
	<div>
		<p class="font-semibold">{user.username}</p>
		<p class="text-sm text-muted-foreground">{user.name}</p>
	</div>
</a>
