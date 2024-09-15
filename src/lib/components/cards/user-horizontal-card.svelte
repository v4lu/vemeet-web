<script lang="ts">
	import type { User } from '$lib/types/user.types';
	import { Avatar } from '../ui/avatar';

	type UserHorizontalCardProps = {
		user: User;
	};

	let { user }: UserHorizontalCardProps = $props();
</script>

<a
	href={`/profile/${user.id}`}
	class="group flex w-full cursor-pointer items-center justify-start rounded-2xl border border-border bg-accent px-3 py-2 backdrop-blur-[10px] transition duration-150 ease-in-out hover:border-primary"
>
	<Avatar {user} class="size-8" />
	<div class="ml-[10px] min-w-[14rem]">
		<div class="flex items-center justify-between">
			<p class="font-medium transition-colors duration-200 group-hover:text-primary">
				{user.username}
			</p>
		</div>
	</div>
</a>
