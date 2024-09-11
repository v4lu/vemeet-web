<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';
</script>

<div class="container mx-auto max-w-2xl">
	<h1 class="mb-6 text-2xl font-bold">Settings</h1>

	<ul class="divide-y divide-muted">
		<li>
			<a href="/settings/edit-profile" class="flex items-center justify-between py-4">
				<span class="flex items-center">
					<Icon icon="solar:user-bold" class="mr-4 size-6" />
					<span>Edit Profile</span>
				</span>
				<Icon icon="solar:alt-arrow-right-outline" class="size-5" />
			</a>
		</li>
		<li>
			<a href="/settings/security" class="flex items-center justify-between py-4">
				<span class="flex items-center">
					<Icon icon="solar:shield-keyhole-bold" class="mr-4 size-6" />
					<span>Security</span>
				</span>
				<Icon icon="solar:alt-arrow-right-outline" class="size-5" />
			</a>
		</li>
		<li>
			<a href="/settings/privacy" class="flex items-center justify-between py-4">
				<span class="flex items-center">
					<Icon icon="solar:lock-bold" class="mr-4 size-6" />
					<span>Privacy</span>
				</span>
				<Icon icon="solar:alt-arrow-right-outline" class="size-5" />
			</a>
		</li>
	</ul>

	<div class="mt-8">
		<Button variant="outline" class="w-full">
			<Icon icon="solar:logout-2-outline" class="mr-2" width="20" height="20" />
			Log Out
		</Button>
	</div>
</div>
