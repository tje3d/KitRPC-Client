<script lang="ts">
  import { subscribe } from '$lib/helpers/svelte-rxjs.helper';
  import { useApiPost } from '$lib/helpers/useRequest.helper';

  export let onLoggedOut: () => void;

  const { clearError, errorMessage, loading, request, responseSuccess } = useApiPost<
    undefined,
    { success: boolean }
  >('/v1/logout', {
    validateResponse: (r) => !!r?.response?.success
  });

  subscribe(responseSuccess, () => {
    onLoggedOut();
  });

  function logout() {
    request(undefined);
  }
</script>

<slot loading={$loading} errorMessage={$errorMessage} {clearError} {logout} />
