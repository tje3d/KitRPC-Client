<script lang="ts">
	import DialogContainer from '$lib/dialog/DialogContainer.svelte';
	import { initAuthFlow, ready, setAuthUser, setIsLoggedIn } from '$lib/flow/auth.flow';
	import { subscribe } from '$lib/helpers/svelte-rxjs.helper';
	import ToastContainer from '$lib/toast/ToastContainer.svelte';
	import '../app.css';
	import type { LayoutData } from './$types';

	let { children, data }: { children: any; data: LayoutData } = $props();

	// Sync server-side user data with client-side auth state
	$effect(() => {
		if (data.user) {
			setAuthUser(data.user);
			setIsLoggedIn(true);
		} else {
			setAuthUser(undefined);
			setIsLoggedIn(false);
		}
	});

	// Initialize auth flow
	subscribe(initAuthFlow);
</script>

<ToastContainer />
<DialogContainer />

{#if $ready}
	{@render children()}
{/if}
