<script lang="ts">
  import { goto } from '$app/navigation';
  import AuthCard from '$lib/components/AuthCard.svelte';
  import ErrorDisplay from '$lib/components/ErrorDisplay.svelte';
  import FormInput from '$lib/components/FormInput.svelte';
  import PageWrapper from '$lib/components/PageWrapper.svelte';
  import PasswordStrengthIndicator from '$lib/components/PasswordStrengthIndicator.svelte';
  import PrimaryButton from '$lib/components/PrimaryButton.svelte';
  import { setAuthUser, setIsLoggedIn } from '$lib/flow/auth.flow';
  import { SvelteSubject } from '$lib/helpers/rxjs.helper';
  import RegisterProvider from '$lib/providers/RegisterProvider.svelte';
  import { toast } from '$lib/toast/store';
  import { rules, useForm, type FormConfig } from '$lib/utils/validation';

  // Form state
  const useEmail$ = new SvelteSubject<boolean>(true);
  const email$ = new SvelteSubject<string>('');
  const mobile$ = new SvelteSubject<string>('');
  const password$ = new SvelteSubject<string>('');
  const confirmPassword$ = new SvelteSubject<string>('');

  // Form validation configuration
  const formConfig: FormConfig = {
    email: {
      rules: [rules.required, rules.email],
      label: 'Email address',
      condition: (formData) => formData.useEmail
    },
    mobile: {
      rules: [rules.required, rules.mobile],
      label: 'Mobile number',
      condition: (formData) => !formData.useEmail
    },
    password: {
      rules: [rules.required, rules.minLength(8)],
      label: 'Password'
    },
    confirmPassword: {
      rules: [rules.required, rules.matches('password', 'Password')],
      label: 'Confirm password'
    }
  };

  // Initialize form validation
  const { errors, validate, reset: resetValidation, firstError, isValid } = useForm(formConfig);

  // Reactive form data for validation
  $: formData = {
    useEmail: $useEmail$,
    email: $email$,
    mobile: $mobile$,
    password: $password$,
    confirmPassword: $confirmPassword$
  };

  // Computed validation
  $: formValid = isValid(formData);

  // Actions
  function handleRegister(e: SubmitEvent, register: Function) {
    e.preventDefault();

    // Validate form before submission
    const isValid = validate(formData);
    if (!isValid) {
      return;
    }

    const registerData = {
      password: $password$,
      ...($useEmail$ ? { email: $email$ } : { mobile: $mobile$ })
    };

    register(registerData);
  }

  function toggleRegistrationMethod(clearError: Function) {
    useEmail$.next(!$useEmail$);
    email$.next('');
    mobile$.next('');
    resetValidation();
    clearError();
  }

  function onRegistered(user: App.AuthUser, token: string) {
    // Set authentication state
    setAuthUser(user);
    setIsLoggedIn(true);

    // Show success toast
    toast.success('Account created successfully! Welcome to TaskFlow.');

    // Navigate to home
    goto('/');
  }

  function handleInputBlur() {
    // Trigger validation on blur
    validate(formData);
  }
</script>

<PageWrapper
  title="Create Account - KitRPC"
  description="Join KitRPC - Create your account to start building powerful tRPC applications"
>
  <RegisterProvider {onRegistered} let:loading let:errorMessage let:clearError let:register>
    <AuthCard
      title="Create your account"
      subtitle="Already have an account?"
      iconClass="icon-[heroicons--user-plus]"
      linkText="Sign in"
      linkHref="/login"
      linkLabel="Sign in"
    >
      <form on:submit={(e) => handleRegister(e, register)} class="space-y-6" novalidate>
        <!-- Registration Method Toggle -->
        <div class="flex justify-center">
          <div class="inline-flex rounded-2xl bg-gray-100/80 p-1 shadow-inner backdrop-blur-sm">
            <button
              type="button"
              on:click={() => toggleRegistrationMethod(clearError)}
              class="rounded-xl px-6 py-2.5 text-sm font-medium transition-all duration-200 {$useEmail$
                ? 'bg-white text-gray-900 shadow-md'
                : 'text-gray-500 hover:text-gray-700'}"
            >
              <span class="icon-[heroicons--at-symbol] mr-2 inline h-4 w-4"></span>
              Email
            </button>
            <button
              type="button"
              on:click={() => toggleRegistrationMethod(clearError)}
              class="rounded-xl px-6 py-2.5 text-sm font-medium transition-all duration-200 {!$useEmail$
                ? 'bg-white text-gray-900 shadow-md'
                : 'text-gray-500 hover:text-gray-700'}"
            >
              <span class="icon-[heroicons--device-phone-mobile] mr-2 inline h-4 w-4"></span>
              Mobile
            </button>
          </div>
        </div>

        <!-- Error Display -->
        <ErrorDisplay
          {errorMessage}
          firstError={$firstError}
          onDismiss={() => {
            clearError();
            resetValidation();
          }}
        />

        <!-- Email/Mobile Input -->
        {#if $useEmail$}
          <FormInput
            id="email"
            name="email"
            type="email"
            label="Email address"
            placeholder="Enter your email address"
            bind:value={$email$}
            error={$errors?.['email'] || null}
            autocomplete="email"
            required
            onBlur={handleInputBlur}
          />
        {:else}
          <FormInput
            id="mobile"
            name="mobile"
            type="tel"
            label="Mobile number"
            placeholder="Enter your mobile number"
            bind:value={$mobile$}
            error={$errors?.['mobile'] || null}
            autocomplete="tel"
            required
            onBlur={handleInputBlur}
          />
        {/if}

        <!-- Password Input -->
        <div class="space-y-2">
          <FormInput
            id="password"
            name="password"
            type="password"
            label="Password"
            placeholder="Create a strong password"
            bind:value={$password$}
            error={$errors?.['password'] || null}
            autocomplete="new-password"
            required
            onBlur={handleInputBlur}
          />

          <!-- Password Strength Indicator -->
          <PasswordStrengthIndicator password={$password$} />
        </div>

        <!-- Confirm Password Input -->
        <FormInput
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label="Confirm password"
          placeholder="Confirm your password"
          bind:value={$confirmPassword$}
          error={$errors?.['confirmPassword'] || null}
          autocomplete="new-password"
          required
          onBlur={handleInputBlur}
        />

        <!-- Submit Button -->
        <PrimaryButton
          type="submit"
          disabled={loading || !formValid}
          {loading}
          loadingText="Creating your account..."
        >
          <span class="icon-[heroicons--user-plus] mr-2 h-5 w-5" slot="icon"></span>
          Create account
        </PrimaryButton>

        <!-- Terms -->
        <p class="text-center text-xs leading-relaxed text-gray-500">
          By creating an account, you agree to our
          <a href="/terms" class="text-blue-600 underline hover:text-blue-700">Terms of Service</a>
          and
          <a href="/privacy" class="text-blue-600 underline hover:text-blue-700">Privacy Policy</a>
        </p>
      </form>
    </AuthCard>
  </RegisterProvider>
</PageWrapper>
