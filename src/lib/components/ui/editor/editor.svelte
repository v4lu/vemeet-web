<script lang="ts">
	import Icon from '@iconify/svelte';
	import { Editor } from '@tiptap/core';
	import Image from '@tiptap/extension-image';
	import Link from '@tiptap/extension-link';
	import StarterKit from '@tiptap/starter-kit';
	import { onMount } from 'svelte';
	import { Button } from '../button';

	type Props = {
		content: object;
		update: (val: object) => void;
	};

	let { content = $bindable(), update }: Props = $props();

	let editor = $state<Editor | null>(null);
	let fileInput = $state<HTMLInputElement>();

	onMount(() => {
		editor = new Editor({
			element: document.querySelector('#rich-text-editor')!,
			extensions: [
				StarterKit,
				Image,
				Link.configure({
					openOnClick: false
				})
			],
			content,
			onUpdate: ({ editor }) => {
				const json = editor.getJSON();
				update(json);
			}
		});

		return () => {
			if (!editor) return;
			editor.destroy();
		};
	});

	function handleImageUpload(event: Event) {
		if (!editor) return;
		const input = event.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			const file = input.files[0];
			const reader = new FileReader();
			reader.onload = (e) => {
				if (!editor) return;
				const result = e.target?.result as string;
				editor.chain().focus().setImage({ src: result }).run();

				editor.commands.enter();
			};
			reader.readAsDataURL(file);
		}
	}
	const buttons = [
		{
			title: 'Bold',
			icon: 'mdi:format-bold',
			action: () => editor && editor.chain().focus().toggleBold().run()
		},
		{
			title: 'Italic',
			icon: 'mdi:format-italic',
			action: () => editor && editor.chain().focus().toggleItalic().run()
		},
		{
			title: 'Bullet List',
			icon: 'mdi:format-list-bulleted',
			action: () => editor && editor.chain().focus().toggleBulletList().run()
		},
		{
			title: 'Numbered List',
			icon: 'mdi:format-list-numbered',
			action: () => editor && editor.chain().focus().toggleOrderedList().run()
		},
		{
			title: 'Heading 1',
			icon: 'mdi:format-header-1',
			action: () => editor && editor.chain().focus().toggleHeading({ level: 1 }).run()
		},
		{
			title: 'Heading 2',
			icon: 'mdi:format-header-2',
			action: () => editor && editor.chain().focus().toggleHeading({ level: 2 }).run()
		},
		{
			title: 'Heading 3',
			icon: 'mdi:format-header-3',
			action: () => editor && editor.chain().focus().toggleHeading({ level: 3 }).run()
		},
		{
			title: 'Add Link',
			icon: 'mdi:link',
			action: () => {
				// eslint-disable-next-line no-alert
				const url = window.prompt('Enter the URL');
				if (url) {
					if (!editor) return;
					editor.chain().focus().setLink({ href: url }).run();
				}
			}
		},
		{
			title: 'Add Image',
			icon: 'mdi:image',
			action: () => fileInput && fileInput.click()
		}
	];
</script>

<div class="space-y-2">
	<div class="flex flex-wrap gap-2">
		{#each buttons as button}
			<Button
				type="button"
				size="icon-sm"
				variant="outline"
				onclick={button.action}
				title={button.title}
			>
				<Icon icon={button.icon} />
			</Button>
		{/each}
	</div>
	<div id="rich-text-editor" class="min-h-[200px] rounded border bg-card p-4 shadow-sm"></div>
	<input
		bind:this={fileInput}
		type="file"
		accept="image/*"
		onchange={handleImageUpload}
		class="hidden"
	/>
</div>

<style lang="postcss">
	:global(.ProseMirror) {
		@apply min-h-[200px] outline-none;
	}
	:global(.ProseMirror p.is-editor-empty:first-child::before) {
		@apply pointer-events-none float-left h-0 text-muted-foreground;
		content: attr(data-placeholder);
	}
	:global(.ProseMirror table) {
		@apply w-full table-auto border-collapse;
	}
	:global(.ProseMirror td, .ProseMirror th) {
		@apply relative min-w-[100px] border border-gray-300 p-2;
	}
	:global(.ProseMirror ul) {
		@apply list-disc pl-5;
	}
	:global(.ProseMirror ol) {
		@apply list-decimal pl-5;
	}
	:global(.ProseMirror h1) {
		@apply text-2xl font-bold;
	}
	:global(.ProseMirror h2) {
		@apply text-xl font-semibold;
	}
	:global(.ProseMirror h3) {
		@apply text-lg font-medium;
	}
	:global(.ProseMirror img) {
		@apply mx-auto my-4 block h-auto;
	}
	:global(.ProseMirror p) {
		@apply my-2;
	}
	:global(.ProseMirror a) {
		@apply text-blue-500 underline;
	}
	:global(.ProseMirror blockquote) {
		@apply border-l-4 border-gray-300 pl-4 italic;
	}
	:global(.ProseMirror code) {
		@apply rounded bg-gray-100 px-1 py-0.5 font-mono text-sm;
	}
	:global(.ProseMirror pre) {
		@apply rounded bg-gray-100 p-2 font-mono text-sm;
	}
	:global(.ProseMirror hr) {
		@apply my-4 border-t border-gray-300;
	}
</style>
