<script lang="ts">
	import { fade } from 'svelte/transition';

	export let errorMessage: string | null = null;
	export let firstError: string | null = null;
	export let onDismiss: () => void;

	$: hasError = errorMessage || firstError;
</script>

{#if hasError}
	<div
		class="rounded-2xl border border-red-200 bg-red-50/80 p-4 backdrop-blur-sm"
		in:fade={{ duration: 300 }}
	>
		<div class="flex items-start">
			<span class="icon-[heroicons--x-circle-solid] mt-0.5 h-5 w-5 flex-shrink-0 text-red-400"></span>
			<div class="ml-3 flex-1">
				<p class="text-sm text-red-800">{errorMessage || firstError}</p>
			</div>
			<button
				type="button"
				on:click={onDismiss}
				class="ml-3 text-red-400 transition-colors hover:text-red-600"
				aria-label="Dismiss error"
			>
				<span class="icon-[heroicons--x-mark] h-4 w-4"></span>
			</button>
		</div>
	</div>
{/if}