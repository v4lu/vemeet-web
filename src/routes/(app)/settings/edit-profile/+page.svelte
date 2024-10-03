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

<div class="mx-auto my-12 max-w-2xl space-y-6">
	<button
		class="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
		onclick={() => history.back()}
	>
		<Icon icon="solar:arrow-left-linear" class="mr-2 size-5" />
		Back
	</button>

	<form class="space-y-6 rounded-lg bg-card p-6 shadow-lg" onsubmit={handleSubmit}>
		<h1 class="text-2xl font-bold text-foreground">Edit Profile</h1>
		<Field name="Username">
			<Input
				id="username"
				placeholder="Username"
				bind:value={username}
				required
				class="bg-background"
			/>
		</Field>

		<div class="grid gap-6 sm:grid-cols-2">
			<Field name="Name" optional>
				<Input id="name" placeholder="Name" bind:value={name} class="bg-background" />
			</Field>
			<Field name="Gender" optional>
				<Input id="gender" placeholder="Gender" bind:value={gender} class="bg-background" />
			</Field>
		</div>

		<div class="grid gap-6 sm:grid-cols-2">
			<Field name="Country" optional>
				<Input id="country" placeholder="Country" bind:value={countryName} class="bg-background" />
			</Field>
			<Field name="City" optional>
				<Input id="city" placeholder="City" bind:value={cityName} class="bg-background" />
			</Field>
		</div>

		<Field name="Bio" optional>
			<textarea
				id="bio"
				rows="4"
				class={cn(inputVariants(), 'resize-none bg-background')}
				placeholder="Tell us about yourself..."
				bind:value={bio}
			></textarea>
		</Field>

		<Button type="submit" class="w-full" isLoading={isSubmitting} disabled={isSubmitting}>
			{isSubmitting ? 'Saving...' : 'Save Changes'}
		</Button>
	</form>
</div>
