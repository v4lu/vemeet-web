<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';
	import type {
		CreateStoryRequest,
		StoryResponse,
		UserStoriesResponse
	} from '$lib/types/story.types';
	import type { User } from '$lib/types/user.types';
	import { CreateStory, StoryCircle, StoryViewer } from '.';

	interface FeedStoriesProps {
		stories: UserStoriesResponse[];
		createStory: (payload: CreateStoryRequest) => Promise<void>;
		authToken: string;
		userStories: StoryResponse[];
		sessionUser: User;
	}

	let { stories, createStory, authToken, userStories, sessionUser }: FeedStoriesProps = $props();
	let isCreateStoryOpen = $state(false);
	let viewerOpen = $state(false);
	let initialUserIndex = $state(0);
	let initialStoryIndex = $state(0);

	let allStories = $derived([
		{ user: sessionUser, userStories },
		...stories.filter((s) => s.user.id !== sessionUser.id)
	]);

	function openStoryViewer(userIndex: number, storyIndex: number = 0) {
		initialUserIndex = userIndex;
		initialStoryIndex = storyIndex;
		viewerOpen = true;
	}
</script>

<div class="flex flex-col items-center">
	<Button
		variant="outline"
		size="icon"
		class="size-16 rounded-full"
		onclick={() => (isCreateStoryOpen = true)}
	>
		<Icon icon="solar:add-circle-bold" class="size-8 text-primary" />
	</Button>
	<span class="mt-1 text-xs">Add Story</span>
</div>

{#if userStories.length > 0}
	<button onclick={() => openStoryViewer(0)}>
		<StoryCircle user={sessionUser} />
	</button>
{/if}

{#each stories as userStory, index}
	{#if userStory.user.id !== sessionUser.id}
		<button onclick={() => openStoryViewer(userStories.length > 0 ? index + 1 : index)}>
			<StoryCircle user={userStory.user} />
		</button>
	{/if}
{/each}

{#if isCreateStoryOpen}
	<CreateStory {authToken} {createStory} onClose={() => (isCreateStoryOpen = false)} />
{/if}

{#if viewerOpen}
	<StoryViewer
		{allStories}
		{initialUserIndex}
		{initialStoryIndex}
		onClose={() => (viewerOpen = false)}
	/>
{/if}
