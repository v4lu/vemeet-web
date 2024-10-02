<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';

	interface MenuItem {
		href: string;
		icon: string;
		label: string;
	}

	const menuItems: MenuItem[] = $state([
		{ href: '/settings/edit-profile', icon: 'solar:user-bold', label: 'Edit Profile' },
		{ href: '/settings/security', icon: 'solar:shield-keyhole-bold', label: 'Security' },
		{ href: '/settings/privacy', icon: 'solar:lock-bold', label: 'Privacy' }
	]);
</script>

<div class="mt-4">
	<h1 class="mb-6 text-2xl font-bold">Settings</h1>
	<ul class="divide-y divide-muted">
		{#each menuItems as item}
			<li>
				<a href={item.href} class="flex items-center justify-between py-4">
					<span class="flex items-center">
						<Icon icon={item.icon} class="mr-4 size-6" />
						<span>{item.label}</span>
					</span>
					<Icon icon="solar:alt-arrow-right-outline" class="size-5" />
				</a>
			</li>
		{/each}
	</ul>
	<div class="mt-8">
		<Button variant="outline" class="w-full">
			<Icon icon="solar:logout-2-outline" class="mr-2" width="20" height="20" />
			Log Out
		</Button>
	</div>
</div>
