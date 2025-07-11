<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { shareIt } from '$lib/helpers/rxjs.helper';
	import { subscribe } from '$lib/helpers/svelte-rxjs.helper';
	import { createTrpcRequestFn, useTrpcRequest } from '$lib/helpers/useTrpcRequest.helper';
	import { trpc } from '$lib/trpc/client';
	import { BehaviorSubject } from 'rxjs';

	// Form state
	const useEmail$ = new BehaviorSubject<boolean>(true);
	const email$ = new BehaviorSubject<string>('');
	const mobile$ = new BehaviorSubject<string>('');
	const password$ = new BehaviorSubject<string>('');
	const confirmPassword$ = new BehaviorSubject<string>('');

	// Register request
	const registerRequest = useTrpcRequest(
		createTrpcRequestFn((input: { email?: string; mobile?: string; password: string }) => {
			return trpc(page).auth.register.mutate(input);
		})
	);

	// Observable streams
	const loading$ = registerRequest.loading.pipe(shareIt());
	const errorMessage$ = registerRequest.errorMessage.pipe(shareIt());

	// Class constants
	const inputClasses =
		'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none';
	const labelClasses = 'block text-sm font-medium text-gray-700';
	const toggleButtonClasses = 'rounded-md px-4 py-2 text-sm font-medium transition-colors';
	const activeToggleClasses = 'bg-white text-gray-900 shadow-sm';
	const inactiveToggleClasses = 'text-gray-500 hover:text-gray-700';
	const primaryButtonClasses =
		'flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-400';
	const spinnerClasses = 'mr-3 -ml-1 h-5 w-5 animate-spin text-white';
	const errorCardClasses = 'rounded-md border border-red-200 bg-red-50 p-4';

	// Subscribe to successful registration responses using the new subscribe helper
	subscribe(registerRequest.responseSuccess, (result) => {
		if (result) {
			// Registration successful, redirect to home page
			goto('/');
		}
	});

	// Actions
	const registerActions = {
		handleRegister(e: SubmitEvent) {
			e.preventDefault();

			const registerData = {
				password: $password$,
				...($useEmail$ ? { email: $email$ } : { mobile: $mobile$ })
			};

			registerRequest.request(registerData);
		},

		toggleRegistrationMethod() {
			useEmail$.next(!$useEmail$);
			email$.next('');
			mobile$.next('');
			registerRequest.clearError();
		},

		updateEmail(value: string) {
			email$.next(value);
		},

		updateMobile(value: string) {
			mobile$.next(value);
		},

		updatePassword(value: string) {
			password$.next(value);
		},

		updateConfirmPassword(value: string) {
			confirmPassword$.next(value);
		},

		clearError() {
			registerRequest.clearError();
		}
	};
</script>

<svelte:head>
	<title>Register - Todo Manager</title>
</svelte:head>

<div
	class="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 px-4"
>
	<div class="w-full max-w-md space-y-8">
		<div class="text-center">
			<h2 class="text-3xl font-bold text-gray-900">Create your account</h2>
			<p class="mt-2 text-sm text-gray-600">
				Or
				<a href="/login" class="font-medium text-blue-600 hover:text-blue-500">
					sign in to your existing account
				</a>
			</p>
		</div>

		<div class="rounded-xl border border-gray-200 bg-white p-8 shadow-lg">
			<form onsubmit={registerActions.handleRegister} class="space-y-6">
				<!-- Registration method toggle -->
				<div class="flex justify-center">
					<div class="flex rounded-lg bg-gray-100 p-1">
						<button
							type="button"
							onclick={registerActions.toggleRegistrationMethod}
							class="{toggleButtonClasses} {$useEmail$
								? activeToggleClasses
								: inactiveToggleClasses}"
						>
							Email
						</button>
						<button
							type="button"
							onclick={registerActions.toggleRegistrationMethod}
							class="{toggleButtonClasses} {!$useEmail$
								? activeToggleClasses
								: inactiveToggleClasses}"
						>
							Mobile
						</button>
					</div>
				</div>

				<!-- Error Display -->
				{#if $errorMessage$}
					<div class={errorCardClasses}>
						<div class="flex items-center justify-between">
							<div class="flex">
								<svg
									class="h-5 w-5 flex-shrink-0 text-red-400"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										fill-rule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
										clip-rule="evenodd"
									/>
								</svg>
								<p class="ml-3 text-sm text-red-800">{$errorMessage$}</p>
							</div>
							<button
								onclick={() => registerActions.clearError()}
								class="text-red-400 hover:text-red-600"
							>
								<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M6 18L18 6M6 6l12 12"
									></path>
								</svg>
							</button>
						</div>
					</div>
				{/if}

				<!-- Email/Mobile Input -->
				<div>
					{#if $useEmail$}
						<label for="email" class={labelClasses}>Email address</label>
						<input
							id="email"
							name="email"
							type="email"
							autocomplete="email"
							required
							value={$email$}
							oninput={(e) => registerActions.updateEmail((e.target as HTMLInputElement).value)}
							class={inputClasses}
							placeholder="Enter your email"
						/>
					{:else}
						<label for="mobile" class={labelClasses}>Mobile number</label>
						<input
							id="mobile"
							name="mobile"
							type="tel"
							autocomplete="tel"
							required
							value={$mobile$}
							oninput={(e) => registerActions.updateMobile((e.target as HTMLInputElement).value)}
							class={inputClasses}
							placeholder="Enter your mobile number"
						/>
					{/if}
				</div>

				<!-- Password Input -->
				<div>
					<label for="password" class={labelClasses}>Password</label>
					<input
						id="password"
						name="password"
						type="password"
						autocomplete="new-password"
						required
						value={$password$}
						oninput={(e) => registerActions.updatePassword((e.target as HTMLInputElement).value)}
						class={inputClasses}
						placeholder="Enter your password (min 6 characters)"
					/>
				</div>

				<!-- Confirm Password Input -->
				<div>
					<label for="confirmPassword" class={labelClasses}>Confirm Password</label>
					<input
						id="confirmPassword"
						name="confirmPassword"
						type="password"
						autocomplete="new-password"
						required
						value={$confirmPassword$}
						oninput={(e) =>
							registerActions.updateConfirmPassword((e.target as HTMLInputElement).value)}
						class={inputClasses}
						placeholder="Confirm your password"
					/>
				</div>

				<!-- Submit Button -->
				<div>
					<button
						type="submit"
						disabled={$loading$ || (!$email$ && !$mobile$) || !$password$ || !$confirmPassword$}
						class={primaryButtonClasses}
					>
						{#if $loading$}
							<svg
								class={spinnerClasses}
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								></circle>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							Creating account...
						{:else}
							Create account
						{/if}
					</button>
				</div>

				<div class="text-center text-xs text-gray-500">
					By creating an account, you agree to our terms of service and privacy policy.
				</div>
			</form>
		</div>
	</div>
</div>
