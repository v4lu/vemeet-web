<script lang="ts">
	import { cn } from '$lib/cn';
	import { Skeleton } from '$lib/components/ui/skeleton';

	interface SkeletonCardProps {
		class?: string;
	}

	let { class: className }: SkeletonCardProps = $props();
</script>

<div
	class="relative mx-auto h-[28rem] w-full max-w-md overflow-hidden rounded-xl bg-card shadow-lg"
>
	<div class={cn('h-full w-full overflow-hidden rounded-xl bg-card', className)}>
		<div class="relative h-3/4 w-full">
			<Skeleton class="h-full w-full" />
		</div>
		<div class="p-4">
			<Skeleton class="mb-2 h-6 w-2/3" />
			<Skeleton class="mb-2 h-4 w-1/2" />
			<Skeleton class="h-4 w-1/3" />
		</div>
	</div>
</div>
