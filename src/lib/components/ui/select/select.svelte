<script lang="ts">
	import { cn } from '$lib/cn';
	import { inputVariants } from '../input';

	type Props = {
		value: string;
		options: {
			value: string;
			label: string;
		}[];
		id?: string;
		required: boolean;
		class?: string;
	};
	let { options, required, value = $bindable(), class: className, id }: Props = $props();
</script>

<select
	{id}
	bind:value
	{required}
	class={cn(inputVariants({ variant: 'default' }), 'pr-8', className)}
>
	{#each options as option}
		<option value={option.value}>{option.label}</option>
	{/each}
</select>
