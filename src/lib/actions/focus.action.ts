export function Focus(node: HTMLInputElement) {
	node.focus();

	return {
		destroy() {
			// Cleanup if needed
		}
	};
}
