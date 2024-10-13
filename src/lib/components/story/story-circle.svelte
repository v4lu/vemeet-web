<script lang="ts">
	import type { User } from '$lib/types/user.types';
	import { Avatar } from '../ui/avatar';

	type Props = {
		user: User;
	};

	let { user }: Props = $props();
</script>

<div class="flex flex-col items-center">
	<button
		class="mb-1 size-16 rounded-full p-0.5"
		style="background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);"
	>
		<Avatar class="size-full border-2 border-border" {user} />
	</button>
	<span class="w-16 truncate text-center text-xs">{user.username}</span>
</div>
