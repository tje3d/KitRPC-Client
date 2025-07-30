<script lang="ts">
  import { subscribe } from '$lib/helpers/svelte-rxjs.helper';
  import { ApiService, useRequest } from '$lib/helpers/useRequest.helper';
  import type { AjaxResponse } from 'rxjs/ajax';

  export let onRegistered: (user: App.AuthUser, token: string) => void;

  const { clearError, errorMessage, loading, request, responseSuccess } = useRequest<
    { email?: string; mobile?: string; password: string },
    AjaxResponse<{ user: App.AuthUser; token: string; success: boolean }>
  >((body) => ApiService.post('/v1/user/register', body), {
    validateResponse: (r) => !!r?.response?.success
  });

  subscribe(responseSuccess, (result) => {
    if (!result) return;

    onRegistered(result.response.user, result.response.token);
  });

  function register(input: { email?: string; mobile?: string; password: string }) {
    request(input);
  }
</script>

<slot loading={$loading} errorMessage={$errorMessage} {clearError} {register} />
