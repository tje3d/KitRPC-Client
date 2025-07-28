<script lang="ts">
	import { goto } from '$app/navigation';
	import AuthCard from '$lib/components/AuthCard.svelte';
	import ErrorDisplay from '$lib/components/ErrorDisplay.svelte';
	import FormInput from '$lib/components/FormInput.svelte';
	import PageWrapper from '$lib/components/PageWrapper.svelte';
	import PrimaryButton from '$lib/components/PrimaryButton.svelte';
	import { setAuthUser, setIsLoggedIn } from '$lib/flow/auth.flow';
	import { SvelteSubject } from '$lib/helpers/rxjs.helper';
	import LoginProvider from '$lib/providers/LoginProvider.svelte';
	import { toast } from '$lib/toast/store';
	import { rules, useForm, type FormConfig } from '$lib/utils/validation';

	// Form state
	const useEmail$ = new SvelteSubject<boolean>(true);
	const email$ = new SvelteSubject<string>('');
	const mobile$ = new SvelteSubject<string>('');
	const password$ = new SvelteSubject<string>('');

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
			rules: [rules.required],
			label: 'Password'
		}
	};

	// Initialize form validation
	const { errors, validate, reset: resetValidation, firstError, isValid } = useForm(formConfig);

	// Class constants for reused styles
	const toggleButtonBaseClasses =
		'rounded-xl px-6 py-2.5 text-sm font-medium transition-all duration-200';
	const toggleButtonActiveClasses = 'bg-white text-gray-900 shadow-md';
	const toggleButtonInactiveClasses = 'text-gray-500 hover:text-gray-700';

	// Login method toggle options
	const loginMethods = [
		{
			key: 'email',
			label: 'Email',
			icon: `<span class="icon-[heroicons--at-symbol] mr-2 align-middle inline-block h-4 w-4"></span>`,
			isActive: true
		},
		{
			key: 'mobile',
			label: 'Mobile',
			icon: `<span class="icon-[heroicons--device-phone-mobile] mr-2 align-middle inline-block h-4 w-4"></span>`,
			isActive: false
		}
	];

	// Reactive form data for validation
	$: formData = {
		useEmail: $useEmail$,
		email: $email$,
		mobile: $mobile$,
		password: $password$
	};

	// Computed validation
	$: formValid = isValid(formData);

	// Actions
	function onLoggedIn(user: App.AuthUser, token: string) {
		// Set authentication state
		setAuthUser(user);
		setIsLoggedIn(true);

		// Show success toast
		toast.success('Welcome back! You have been signed in successfully.');

		// Navigate to home
		goto('/');
	}

	function handleFormSubmit(event: Event, loginFn: (data: any) => void) {
		event.preventDefault();

		// Validate form before submission
		const isValid = validate(formData);
		if (!isValid) {
			return;
		}

		const loginData = {
			password: $password$,
			...($useEmail$ ? { email: $email$ } : { mobile: $mobile$ })
		};
		loginFn(loginData);
	}

	function handleToggleLoginMethod(clearErrorFn: () => void) {
		useEmail$.next(!$useEmail$);
		email$.next('');
		mobile$.next('');
		resetValidation();
		clearErrorFn();
	}

	function handleInputBlur() {
		// Trigger validation on blur
		validate(formData);
	}
</script>

<PageWrapper
	title="Sign In - KitRPC"
	description="Sign in to KitRPC - Access your API management dashboard"
>
	<LoginProvider {onLoggedIn} let:login let:clearError let:errorMessage let:loading>
		<AuthCard
			title="Welcome back"
			subtitle="Don't have an account?"
			iconClass="icon-[heroicons--check-circle]"
			linkText="Create one now"
			linkHref="/register"
			linkLabel="Create one now"
			footerContent='<p class="text-xs leading-relaxed text-gray-500">Protected by industry-standard encryption. <a href="/security" class="text-blue-600 underline hover:text-blue-700">Learn more</a></p>'
		>
			<form on:submit={(e) => handleFormSubmit(e, login)} class="space-y-6" novalidate>
						<!-- Login Method Toggle -->
						<div class="flex justify-center">
							<div class="inline-flex rounded-2xl bg-gray-100/80 p-1 shadow-inner backdrop-blur-sm">
								{#each loginMethods as method}
									<button
										type="button"
										on:click={() => handleToggleLoginMethod(clearError)}
										class="{toggleButtonBaseClasses} {(
											method.key === 'email' ? $useEmail$ : !$useEmail$
										)
											? toggleButtonActiveClasses
											: toggleButtonInactiveClasses}"
									>
										{@html method.icon}
										{method.label}
									</button>
								{/each}
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
						<FormInput
							id="password"
							name="password"
							type="password"
							label="Password"
							placeholder="Enter your password"
							bind:value={$password$}
							error={$errors?.['password'] || null}
							autocomplete="current-password"
							required
							showPasswordToggle
							onBlur={handleInputBlur}
						>
							<a
								href="/forgot-password"
								class="text-sm text-blue-600 transition-colors hover:text-blue-700"
								slot="rightElement"
							>
								Forgot password?
							</a>
						</FormInput>

						<!-- Remember Me -->
						<div class="flex items-center justify-between">
							<div class="flex items-center">
								<input
									id="remember-me"
									name="remember-me"
									type="checkbox"
									class="h-4 w-4 rounded border-gray-300 text-blue-600 transition-colors focus:ring-blue-500"
								/>
								<label for="remember-me" class="ml-2 block text-sm text-gray-700">
									Remember me
								</label>
							</div>
						</div>

						<!-- Submit Button -->
						<PrimaryButton
							type="submit"
							disabled={loading || !formValid}
							{loading}
							loadingText="Signing you in..."
						>
							<span class="icon-[heroicons--arrow-right-on-rectangle] mr-2 h-5 w-5" slot="icon"
							></span>
							Sign in
						</PrimaryButton>
			</form>
		</AuthCard>
	</LoginProvider>
</PageWrapper>
