<script lang="ts">
	import { initAuthFlow, ready, setAuthUser, setIsLoggedIn } from '$lib/flow/auth.flow';
	import { subscribe } from '$lib/helpers/svelte-rxjs.helper';
	import { onMount } from 'svelte';
	import '../app.css';
	import type { LayoutData } from './$types';

	let { children, data }: { children: any; data: LayoutData } = $props();

	// Initialize auth flow
	subscribe(initAuthFlow);

	// Sync server-side user data with client-side auth state
	onMount(() => {
		if (data.user) {
			setAuthUser(data.user);
			setIsLoggedIn(true);
		} else {
			setAuthUser(undefined);
			setIsLoggedIn(false);
		}
	});
</script>

{#if $ready}
	{@render children()}
{/if}
