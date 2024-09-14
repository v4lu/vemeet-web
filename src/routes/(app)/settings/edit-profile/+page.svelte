<script lang="ts">
	import { useUpdateUser } from '$lib/api/use-update-user.svelte.js';
	import { cn } from '$lib/cn';
	import { Button } from '$lib/components/ui/button';
	import { Field } from '$lib/components/ui/field';
	import { Input, inputVariants } from '$lib/components/ui/input';
	import { sessionStore } from '$lib/stores/session.store';
	import Icon from '@iconify/svelte';

	let { data } = $props();

	type UserUpdateFormData = {
		username: string;
		bio: string | null;
		name: string | null;
		gender: string | null;
		countryName: string | null;
		cityName: string | null;
	};

	let username = $state($sessionStore.username);
	let name = $state($sessionStore.name ?? '');
	let gender = $state($sessionStore.gender || '');
	let countryName = $state($sessionStore.countryName || '');
	let cityName = $state($sessionStore.cityName || '');
	let bio = $state($sessionStore.bio || '');

	const { isSubmitting, updateUser } = useUpdateUser(data.accessToken);

	async function handleSubmit(event: Event): Promise<void> {
		event.preventDefault();
		const payload: UserUpdateFormData = {
			username,
			bio,
			name,
			gender,
			countryName,
			cityName
		};
		await updateUser(payload);
	}
</script>

<button class="mt-6 flex items-center text-sm font-medium" onclick={(): void => history.back()}>
	<Icon icon="solar:arrow-left-linear" class="mr-2 size-6" />
	Back
</button>

<h1 class="mb-6 mt-6 text-2xl font-bold">Edit Profile</h1>

<form class="space-y-6" onsubmit={handleSubmit}>
	<Field name="Username">
		<Input id="username" placeholder="Username" bind:value={username} required />
	</Field>

	<Field name="Name" optional>
		<Input id="name" placeholder="Name" bind:value={name} />
	</Field>

	<Field name="Gender" optional>
		<Input id="gender" placeholder="Gender" bind:value={gender} />
	</Field>

	<Field name="Country" optional>
		<Input id="country" placeholder="Country" bind:value={countryName} />
	</Field>

	<Field name="City" optional>
		<Input id="city" placeholder="City" bind:value={cityName} />
	</Field>

	<Field name="Bio" optional>
		<textarea
			id="bio"
			rows="4"
			class={cn(inputVariants(), 'resize-none')}
			placeholder="Bio"
			bind:value={bio}
		></textarea>
	</Field>

	<Button type="submit" class="w-full" isLoading={isSubmitting} disabled={isSubmitting}>
		{#if isSubmitting}
			Saving...
		{:else}
			Save
		{/if}
	</Button>
</form>
