import { writable } from 'svelte/store';

type Toast = {
	id: number;
	message: string;
	type: 'success' | 'error';
};

type ToastStore = {
	subscribe: (this: void, run: (value: Toast[]) => void, invalidate?: () => void) => () => void;
	success: (message: string) => void;
	error: (message: string) => void;
};

function createToastStore(): ToastStore {
	const { subscribe, update } = writable<Toast[]>([]);

	let id = 0;

	function addToast(message: string, type: 'success' | 'error' = 'success'): void {
		const toast: Toast = { id: id++, message, type };
		update((toasts) => [...toasts, toast]);
		setTimeout(() => removeToast(toast.id), 3000);
	}

	function removeToast(id: number): void {
		update((toasts) => toasts.filter((t) => t.id !== id));
	}

	return {
		subscribe,
		success: (message: string): void => addToast(message, 'success'),
		error: (message: string): void => addToast(message, 'error')
	};
}

export const toast = createToastStore();
