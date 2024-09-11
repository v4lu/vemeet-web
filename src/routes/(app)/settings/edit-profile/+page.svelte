<script lang="ts">
	import { api, createAuthHeaders } from '$lib/api';
	import { cn } from '$lib/cn';
	import { Button } from '$lib/components/ui/button';
	import { Field } from '$lib/components/ui/field';
	import { Input, inputVariants } from '$lib/components/ui/input';
	import { sessionStore } from '$lib/stores/session.store';
	import { toast } from '$lib/stores/toast.store.js';
	import type { ServerErrorResponse } from '$lib/types/ky.types.js';
	import type { User } from '$lib/types/user.types.js';
	import Icon from '@iconify/svelte';
	import { HTTPError } from 'ky';

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
	let isSubmitting = $state(false);

	async function handleSubmit(event: Event): Promise<void> {
		event.preventDefault();
		isSubmitting = true;

		const payload: UserUpdateFormData = {
			username,
			bio,
			name,
			gender,
			countryName,
			cityName
		};

		try {
			const res = await api
				.patch<User>('users', {
					json: payload,
					headers: createAuthHeaders(data.accessToken)
				})
				.json();

			sessionStore.setUser(res);
			toast.success('Profile updated successfully');
		} catch (e) {
			if (e instanceof HTTPError) {
				const eRes = (await e.response.json()) as ServerErrorResponse;
				if (eRes.statusCode === 409) {
					toast.error(eRes.message);
				}
				console.error(eRes);
			} else {
				toast.error('An error occurred while updating your profile');
			}
		} finally {
			isSubmitting = false;
		}
	}
</script>

<button class="flex items-center text-sm font-medium" onclick={(): void => history.back()}>
	<Icon icon="solar:arrow-left-linear" class="mr-2 size-6" />
	Back
</button>

<h1 class="mb-6 mt-3 text-2xl font-bold">Edit Profile</h1>

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
