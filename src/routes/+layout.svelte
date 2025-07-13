<script lang="ts">
	import { initAuthFlow, ready, setAuthUser, setIsLoggedIn } from '$lib/flow/auth.flow';
	import { subscribe } from '$lib/helpers/svelte-rxjs.helper';
	import ToastContainer from '$lib/toast/ToastContainer.svelte';
	import '../app.css';
	import type { LayoutData } from './$types';

	let { children, data }: { children: any; data: LayoutData } = $props();
	let user = $derived(data.user);

	// Sync server-side user data with client-side auth state
	$effect(() => {
		if (user) {
			setAuthUser(user);
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

{#if $ready}
	{@render children()}
{/if}
