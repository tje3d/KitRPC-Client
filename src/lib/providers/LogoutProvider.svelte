<script lang="ts">
	import { page } from '$app/state';
	import { subscribe } from '$lib/helpers/svelte-rxjs.helper';
	import { createTrpcRequestFn, useTrpcRequest } from '$lib/helpers/useTrpcRequest.helper';
	import { trpc } from '$lib/trpc/client';

	export let onLoggedOut: () => void;

	const { clearError, errorMessage, loading, trigger, responseSuccess } = useTrpcRequest(
		createTrpcRequestFn(() => {
			return trpc(page).auth.logout.mutate();
		})
	);

	subscribe(responseSuccess, (result) => {
		if (!result) return;

		onLoggedOut();
	});

	function logout() {
		trigger.next(undefined);
	}
</script>

<slot loading={$loading} errorMessage={$errorMessage} {clearError} {logout} />
