<script lang="ts">
	import DialogContainer from '$lib/dialog/DialogContainer.svelte';
	import { initAuthFlow, ready } from '$lib/flow/auth.flow';
	import { subscribe } from '$lib/helpers/svelte-rxjs.helper';
	import ToastContainer from '$lib/toast/ToastContainer.svelte';
	import '../app.css';
	import type { LayoutData } from './$types';

	let { children, data }: { children: any; data: LayoutData } = $props();

	// Initialize auth flow
	subscribe(initAuthFlow);
</script>

<ToastContainer />
<DialogContainer />

{#if $ready}
	{@render children()}
{/if}
