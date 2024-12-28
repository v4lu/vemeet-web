<script lang="ts">
	import Icon from '@iconify/svelte';
	import { useSwiperModeSetup } from '$lib/api/use-swipper-setup.svelte.js';
	import { cn } from '$lib/cn.js';
	import { SwiperHome } from '$lib/components/swiper/index.js';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import CustomHeaderWithTitle from '$lib/components/ui/custom-header/custom-header-with-title.svelte';
	import CustomHeader from '$lib/components/ui/custom-header/custom-header.svelte';
	import { Drawer } from '$lib/components/ui/drawer/index.js';
	import { Input } from '$lib/components/ui/input';
	import { Modal } from '$lib/components/ui/modals';
	import { Select } from '$lib/components/ui/select';
	import { sessionStore } from '$lib/stores/session.store';

	type NavigationType = {
		path: string;
		icon: string;
	};

	let { data } = $props();
	const { resp, configureSwiperPreferences } = useSwiperModeSetup(
		data.accessToken,
		$sessionStore,
		data.userSwiperConfigurated!,
		data.userSwiperPreferences!
	);

	let showSwiperModeModal = $state(false);
	let showProfileModal = $state(false);
	let showConfigModal = $state(false);

	let minAge = $state(18);
	let maxAge = $state(50);
	let preferredGender = $state('Female');
	let maxDistance = $state(50);
	let isMobile = $state(true);

	const genderOptions = [
		{ value: 'Female', label: 'Female' },
		{ value: 'Male', label: 'Male' },
		{ value: 'Any', label: 'Any' }
	];

	function checkConfiguration() {
		if (!resp.isSwiperMode) {
			showSwiperModeModal = true;
		} else if (!resp.hasEverythingSetup) {
			showProfileModal = true;
		} else if (!resp.isConfigurated) {
			showConfigModal = true;
		}
	}

	async function handleSubmit(event: Event) {
		event.preventDefault();
		const payload = {
			minAge,
			maxAge,
			preferredGender,
			maxDistance
		};
		await configureSwiperPreferences(payload);
		showConfigModal = false;
		resp.isConfigurated = true;
		checkConfiguration();
	}

	checkConfiguration();

	$effect(() => {
		const mediaQuery = window.matchMedia('(max-width: 768px)');

		function handleResize(e: MediaQueryListEvent | MediaQueryList) {
			isMobile = e.matches;
		}

		mediaQuery.addEventListener('change', handleResize);

		handleResize(mediaQuery);

		return () => {
			mediaQuery.removeEventListener('change', handleResize);
		};
	});

	const Dialog = $derived(isMobile ? Drawer : Modal);

	let navigation = $state<NavigationType[]>([
		{
			path: '/swiper/messages',
			icon: 'solar:heart-angle-bold'
		},
		{
			path: '/swiper/profile',
			icon: 'solar:user-bold'
		},
		{
			path: '/swiper/preferences',
			icon: 'solar:settings-bold'
		}
	]);
</script>

{#if showSwiperModeModal}
	<Dialog onClose={() => (showSwiperModeModal = false)}>
		<h2 class="mb-4 text-xl font-bold">Swiper Mode is Disabled</h2>
		<p>You need to enable Swiper Mode in your privacy settings to continue.</p>
		<div class="mt-4 flex justify-end">
			<a class={buttonVariants({ size: 'sm', variant: 'outline' })} href="/settings/privacy">
				Go to Privacy Settings
			</a>
		</div>
	</Dialog>
{/if}

{#if showProfileModal}
	<Dialog onClose={() => (showProfileModal = false)}>
		<h2 class="mb-4 text-xl font-bold">Profile Information Incomplete</h2>
		<p>
			Please complete your profile information to use Swiper Mode. We need to know your location
		</p>
		<div class="mt-4 flex justify-end">
			<a class={buttonVariants({ size: 'sm', variant: 'outline' })} href="/settings/edit-profile">
				Edit Profile
			</a>
		</div>
	</Dialog>
{/if}

{#if showConfigModal}
	<Dialog onClose={() => (showConfigModal = false)}>
		<h2 class="mb-4 text-xl font-bold">Swiper Mode Configuration</h2>
		<p class="mb-4">Please configure your Swiper preferences to continue.</p>
		<form onsubmit={handleSubmit} class="space-y-4">
			<div class="flex space-x-4">
				<div class="flex-1">
					<label for="minAge" class="block text-sm font-medium text-muted-foreground"
						>Minimum Age</label
					>
					<Input type="number" id="minAge" bind:value={minAge} min="18" max="100" required />
				</div>
				<div class="flex-1">
					<label for="maxAge" class="block text-sm font-medium text-muted-foreground"
						>Maximum Age</label
					>
					<Input type="number" id="maxAge" bind:value={maxAge} min="18" max="100" required />
				</div>
			</div>
			<div>
				<label for="preferredGender" class="block text-sm font-medium text-muted-foreground"
					>Preferred Gender</label
				>
				<Select
					id="preferredGender"
					bind:value={preferredGender}
					options={genderOptions}
					required
				/>
			</div>
			<div>
				<label for="maxDistance" class="block text-sm font-medium text-muted-foreground"
					>Maximum Distance (km)</label
				>
				<Input
					type="number"
					id="maxDistance"
					bind:value={maxDistance}
					min="1"
					max="100000"
					required
				/>
			</div>
			<div class="flex justify-end">
				<Button type="submit" size="sm" disabled={resp.isLoadingConfigurateSwiperPreferences}>
					{resp.isLoadingConfigurateSwiperPreferences ? 'Configuring...' : 'Configure Preferences'}
				</Button>
			</div>
		</form>
	</Dialog>
{/if}

{#if resp.isUserReady}
	<CustomHeader>
		<div class="container mx-auto flex items-center justify-end">
			{#each navigation as { path, icon }}
				<a
					class={cn(
						data.pathname === path && 'text-primary',
						buttonVariants({ size: 'icon', variant: 'ghost' })
					)}
					href={path}
				>
					<Icon {icon} class="size-6" />
				</a>
			{/each}
		</div>
	</CustomHeader>
	<SwiperHome authToken={data.accessToken} />
{:else}
	<CustomHeaderWithTitle title="Swiper Mode" />
{/if}
