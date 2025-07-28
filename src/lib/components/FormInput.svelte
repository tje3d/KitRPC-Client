<script lang="ts">
	import type { FullAutoFill } from "svelte/elements";

	export let id: string;
	export let name: string;
	export let type: string = 'text';
	export let label: string;
	export let placeholder: string = '';
	export let value: string = '';
	export let error: string | null = null;
	export let autocomplete: FullAutoFill | undefined = undefined;
	export let required: boolean = false;
	export let showPasswordToggle: boolean = false;
	export let onBlur: (() => void) | null = null;

	let showPassword = false;

	// Base input classes
	const baseInputClasses =
		'w-full rounded-2xl border border-gray-200 bg-white/50 px-4 py-3 placeholder-gray-400 backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500';
	const errorInputClasses = 'border-red-300 bg-red-50/50';

	$: inputClasses = `${baseInputClasses} ${error ? errorInputClasses : ''}`;
	$: inputType = showPasswordToggle && showPassword ? 'text' : type;

	function togglePasswordVisibility() {
		showPassword = !showPassword;
	}

	function handleBlur() {
		if (onBlur) {
			onBlur();
		}
	}
</script>

<div class="space-y-2">
	<div class="flex items-center justify-between">
		<label for={id} class="block text-sm font-semibold text-gray-700">
			{label}
		</label>
		<slot name="rightElement" />
	</div>
	<div class="relative">
		<input
			{id}
			{name}
			type={inputType}
			{autocomplete}
			{required}
			bind:value
			on:blur={handleBlur}
			class={inputClasses}
			{placeholder}
		/>
		{#if showPasswordToggle}
			<button
				type="button"
				on:click={togglePasswordVisibility}
				class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition-colors hover:text-gray-600"
				aria-label={showPassword ? 'Hide password' : 'Show password'}
			>
				{#if showPassword}
					<span class="icon-[heroicons--eye-slash] h-5 w-5"></span>
				{:else}
					<span class="icon-[heroicons--eye] h-5 w-5"></span>
				{/if}
			</button>
		{/if}
		{#if error}
			<p class="mt-1 text-sm text-red-600">{error}</p>
		{/if}
	</div>
</div>