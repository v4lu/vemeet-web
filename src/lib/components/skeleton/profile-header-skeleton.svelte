<script lang="ts">
	import { Skeleton } from '$lib/components/ui/skeleton';
	import Icon from '@iconify/svelte';
</script>

<div class="flex items-start justify-between p-6 pt-4">
	<div class="flex items-center">
		<div class="relative">
			<div
				class="relative size-fit cursor-pointer rounded-full border-[3px] border-white shadow-xl"
			>
				<Skeleton class="size-20 rounded-full" />
			</div>
		</div>
		<div class="ml-4">
			<Skeleton class="mb-2 h-7 w-40" />
			<Skeleton class="h-4 w-24" />
		</div>
	</div>
</div>

<Skeleton class="ml-4 mt-4 h-4 w-3/4 max-w-md" />

<div class="mt-4 flex space-x-6 px-4">
	<span class="flex items-center">
		<Icon icon="solar:map-point-bold" class="mr-2 size-5 text-muted" />
		<Skeleton class="h-4 w-32" />
	</span>
	<span class="flex items-center">
		<Icon icon="ph:egg-crack-duotone" class="mr-2 size-5 text-muted" />
		<Skeleton class="h-4 w-24" />
	</span>
</div>

<div class="mt-4 flex items-center px-4 pb-2">
	<div class="mr-8">
		<Skeleton class="h-6 w-20" />
	</div>
	<div class="mr-6">
		<Skeleton class="h-6 w-20" />
	</div>
</div>
