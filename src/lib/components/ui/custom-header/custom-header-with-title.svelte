<script lang="ts">
	import { CustomHeader } from '.';

	type Props = {
		title: string;
	};

	let { title }: Props = $props();
</script>

<CustomHeader class="relative items-center justify-center">
	<h1 class="pr-16 text-lg font-bold">{title}</h1>
	<div></div>
</CustomHeader>
