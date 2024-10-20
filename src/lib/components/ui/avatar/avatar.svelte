<script lang="ts">
	import { cn } from '$lib/cn';
	import type { User } from '$lib/types/user.types';
	import { getInitial } from '$lib/utils';

	type AvatarProps = {
		user: User;
		class?: string;
	};

	let { user, class: className }: AvatarProps = $props();
</script>

<div class={cn('aspect-square size-8 rounded-full', className)}>
	{#if user.profileImage?.url}
		<img
			alt={user.username}
			src={user.profileImage.url}
			class="aspect-square size-fit rounded-full bg-cover bg-center object-cover object-center"
		/>
	{:else}
		<div
			class="flex aspect-square items-center justify-center rounded-full border-[2px] border-white bg-gradient-to-tr from-primary/10 via-primary/50 to-primary text-primary-foreground shadow-md"
		>
			<span class="font-medium text-primary">
				{getInitial(user.username)}
			</span>
		</div>
	{/if}
</div>
