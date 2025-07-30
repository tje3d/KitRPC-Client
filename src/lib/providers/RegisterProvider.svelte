<script lang="ts">
  import { subscribe } from '$lib/helpers/svelte-rxjs.helper';
  import { useApiPost } from '$lib/helpers/useRequest.helper';

  interface RegisterRequest {
    email?: string;
    mobile?: string;
    password: string;
  }

  interface RegisterResponse {
    user: App.AuthUser;
    token: string;
    success: boolean;
  }

  export let onRegistered: (user: App.AuthUser, token: string) => void;

  const { clearError, errorMessage, loading, request, responseSuccess } = useApiPost<
    RegisterRequest,
    RegisterResponse
  >('/v1/user/register', {
    validateResponse: (r) => !!r?.response?.success
  });

  subscribe(responseSuccess, (r) => {
    onRegistered(r.response.user, r.response.token);
  });

  function register(input: RegisterRequest) {
    request(input);
  }
</script>

<slot loading={$loading} errorMessage={$errorMessage} {clearError} {register} />
