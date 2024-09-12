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
