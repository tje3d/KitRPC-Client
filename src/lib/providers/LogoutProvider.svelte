<script lang="ts">
	import { subscribe } from '$lib/helpers/svelte-rxjs.helper';
	import { ApiService, useRequest } from '$lib/helpers/useRequest.helper';
	import type { AjaxResponse } from 'rxjs/ajax';

	export let onLoggedOut: () => void;

	const { clearError, errorMessage, loading, trigger, responseSuccess } = useRequest<
		void,
		AjaxResponse<any>
	>((body) => ApiService.post<any>('/v1/logout', body), {
		validateResponse: (r) => !!r?.response?.success
	});

	subscribe(responseSuccess, (result) => {
		if (!result) return;

		onLoggedOut();
	});

	function logout() {
		trigger.next();
	}
</script>

<slot loading={$loading} errorMessage={$errorMessage} {clearError} {logout} />
