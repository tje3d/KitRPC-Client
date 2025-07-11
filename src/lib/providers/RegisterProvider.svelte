<script lang="ts">
	import { page } from '$app/state';
	import { subscribe } from '$lib/helpers/svelte-rxjs.helper';
	import { createTrpcRequestFn, useTrpcRequest } from '$lib/helpers/useTrpcRequest.helper';
	import { trpc } from '$lib/trpc/client';

	export let onRegistered: () => void;

	const { clearError, errorMessage, loading, request, responseSuccess } = useTrpcRequest(
		createTrpcRequestFn((input: { email?: string; mobile?: string; password: string }) => {
			return trpc(page).auth.register.mutate(input);
		})
	);

	subscribe(responseSuccess, (result) => {
		if (!result) return;

		onRegistered();
	});

	function register(input: { email?: string; mobile?: string; password: string }) {
		request(input);
	}
</script>

<slot loading={$loading} errorMessage={$errorMessage} {clearError} {register} />