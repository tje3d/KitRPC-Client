<script lang="ts">
  import { subscribe } from '$lib/helpers/svelte-rxjs.helper';
  import { ApiService, useRequest } from '$lib/helpers/useRequest.helper';
  import type { AjaxResponse } from 'rxjs/ajax';

  export let onLoggedIn: (user: any, token: string) => void;

  const { clearError, errorMessage, loading, trigger, responseSuccess } = useRequest<
    {
      identifier: string;
      password: string;
      unique_id: string;
      'g-recaptcha-response': string;
      two_factor?: string;
      type: string;
    },
    AjaxResponse<{ user: any; token: string; success: boolean }>
  >((body) => ApiService.post('/v1/user/login', body), {
    validateResponse: (r) => !!r?.response?.success
  });

  subscribe(responseSuccess, (result) => {
    if (!result) return;

    onLoggedIn(result.response.user, result.response.token);
  });

  function login(input: {
    identifier: string;
    password: string;
    unique_id: string;
    'g-recaptcha-response': string;
    two_factor?: string;
    type: string;
  }) {
    trigger.next(input);
  }
</script>

<slot loading={$loading} errorMessage={$errorMessage} {clearError} {login} />
