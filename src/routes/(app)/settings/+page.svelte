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

<div class="mx-auto mt-12 max-w-2xl rounded-xl bg-card p-6 shadow-lg">
	<h1 class="mb-6 text-2xl font-bold text-foreground">Settings</h1>
	<ul class="space-y-2">
		{#each menuItems as item}
			<li>
				<a
					href={item.href}
					class="flex items-center justify-between rounded-lg p-4 transition-all duration-200 hover:bg-muted/50"
				>
					<span class="flex items-center">
						<Icon icon={item.icon} class="mr-4 size-6 text-primary" />
						<span class="font-medium text-foreground">{item.label}</span>
					</span>
					<Icon icon="solar:alt-arrow-right-outline" class="size-5 text-muted-foreground" />
				</a>
			</li>
		{/each}
	</ul>
	<div class="mt-8">
		<Button variant="outline" class="w-full hover:bg-destructive hover:text-destructive-foreground">
			<Icon icon="solar:logout-2-outline" class="mr-2" width="20" height="20" />
			Log Out
		</Button>
	</div>
</div>
