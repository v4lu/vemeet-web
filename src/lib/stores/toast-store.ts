import { writable } from 'svelte/store';

type Toast = {
	id: number;
	message: string;
	type: 'success' | 'error';
};

function createToastStore() {
	const { subscribe, update } = writable<Toast[]>([]);

	let id = 0;

	function addToast(message: string, type: 'success' | 'error' = 'success') {
		const toast: Toast = { id: id++, message, type };
		update((toasts) => [...toasts, toast]);
		setTimeout(() => removeToast(toast.id), 3000);
	}

	function removeToast(id: number) {
		update((toasts) => toasts.filter((t) => t.id !== id));
	}

	return {
		subscribe,
		success: (message: string) => addToast(message, 'success'),
		error: (message: string) => addToast(message, 'error')
	};
}

export const toast = createToastStore();
