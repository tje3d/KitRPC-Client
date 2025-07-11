<script lang="ts">
	import { page } from '$app/state';
	import { subscribe } from '$lib/helpers/svelte-rxjs.helper';
	import { createTrpcRequestFn, useTrpcRequest } from '$lib/helpers/useTrpcRequest.helper';
	import { trpc } from '$lib/trpc/client';

	export let onLoggedIn: () => void;

	const { clearError, errorMessage, loading, trigger, responseSuccess } = useTrpcRequest(
		createTrpcRequestFn((input: { email?: string; mobile?: string; password: string }) => {
			return trpc(page).auth.login.mutate(input);
		})
	);

	subscribe(responseSuccess, (result) => {
		if (!result) return;

		onLoggedIn();
	});

	function login(input: { email?: string; mobile?: string; password: string }) {
		trigger.next(input);
	}
</script>

<slot loading={$loading} errorMessage={$errorMessage} {clearError} {login} />
