<script lang="ts">
  import { subscribe } from '$lib/helpers/svelte-rxjs.helper';
  import { useApiPost } from '$lib/helpers/useRequest.helper';

  type LoginRequest = {
    identifier: string;
    password: string;
    unique_id: string;
    'g-recaptcha-response': string;
    two_factor?: string;
    type: string;
  };

  type LoginResponse = {
    user: App.AuthUser;
    token: string;
    success: boolean;
  };

  export let onLoggedIn: (user: App.AuthUser, token: string) => void;

  const { clearError, errorMessage, loading, request, responseSuccess } = useApiPost<
    LoginRequest,
    LoginResponse
  >('/v1/user/login', {
    validateResponse: (r) => !!r.response?.success
  });

  subscribe(responseSuccess, (r) => {
    onLoggedIn(r.response.user, r.response.token);
  });

  function login(input: LoginRequest) {
    request(input);
  }
</script>

<slot loading={$loading} errorMessage={$errorMessage} {clearError} {login} />
