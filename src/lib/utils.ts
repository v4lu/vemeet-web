import { onMount } from 'svelte';

export function capitalize(s: string): string {
	return s.charAt(0).toUpperCase() + s.slice(1);
}

export function clickOutside(node: HTMLElement, onClickOutside: () => void) {
	function handleClick(event: MouseEvent) {
		if (node && !node.contains(event.target as Node) && !event.defaultPrevented) {
			onClickOutside();
		}
	}

	document.addEventListener('click', handleClick, true);

	return {
		destroy() {
			document.removeEventListener('click', handleClick, true);
		}
	};
}

export function getInitial(username: string): string {
	return username.charAt(0).toUpperCase();
}

export function debounce<T extends (...args: never[]) => unknown>(
	func: T,
	wait: number
): (...args: Parameters<T>) => void {
	let timeout: ReturnType<typeof setTimeout> | null = null;

	return (...args: Parameters<T>): void => {
		const later = () => {
			timeout = null;
			func(...args);
		};

		if (timeout !== null) {
			clearTimeout(timeout);
		}
		timeout = setTimeout(later, wait);
	};
}

export function scrollToSection(event: Event, id: string, offset: number) {
	event.preventDefault();
	const element = document.getElementById(id);
	if (element) {
		const offsetTop = element.getBoundingClientRect().top + window.scrollY;

		window.scroll({
			top: offsetTop + offset,
			behavior: 'smooth'
		});
	}
}

export function useIntersection(
	node: HTMLElement,
	options: {
		once?: boolean;
		onIntersect?: (entry: IntersectionObserverEntry) => void;
	}
) {
	let observer: IntersectionObserver;

	const handleIntersect = (entries: IntersectionObserverEntry[]) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				options.onIntersect?.(entry);
				if (options.once) {
					observer.unobserve(node);
				}
			}
		});
	};

	observer = new IntersectionObserver(handleIntersect);
	observer.observe(node);

	return {
		destroy() {
			observer.disconnect();
		}
	};
}
