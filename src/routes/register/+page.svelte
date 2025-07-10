<script lang="ts">
	import type { FullAutoFill } from 'svelte/elements';

	let email = '';
	let mobile = '';
	let password = '';
	let confirmPassword = '';
	let useEmail = true;
	let error = '';
	let loading = false;

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

	// Toggle buttons data
	const toggleButtons = [
		{ label: 'Email', isActive: () => useEmail },
		{ label: 'Mobile', isActive: () => !useEmail }
	];

	// Form fields data
	const formFields = [
		{
			id: 'password',
			label: 'Password',
			type: 'password',
			autocomplete: 'new-password' as FullAutoFill,
			placeholder: 'Enter your password (min 6 characters)',
			bind: () => password,
			set: (value: string) => (password = value)
		},
		{
			id: 'confirmPassword',
			label: 'Confirm Password',
			type: 'password',
			autocomplete: 'new-password' as FullAutoFill,
			placeholder: 'Confirm your password',
			bind: () => confirmPassword,
			set: (value: string) => (confirmPassword = value)
		}
	];

	async function handleRegister() {
		// ...
	}

	function toggleRegistrationMethod() {
		useEmail = !useEmail;
		email = '';
		mobile = '';
		error = '';
	}
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
			<form on:submit|preventDefault={handleRegister} class="space-y-6">
				<!-- Registration method toggle -->
				<div class="flex justify-center">
					<div class="flex rounded-lg bg-gray-100 p-1">
						{#each toggleButtons as button}
							<button
								type="button"
								on:click={toggleRegistrationMethod}
								class="{toggleButtonClasses} {button.isActive()
									? activeToggleClasses
									: inactiveToggleClasses}"
							>
								{button.label}
							</button>
						{/each}
					</div>
				</div>

				{#if error}
					<div class={errorCardClasses}>
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
							<p class="ml-3 text-sm text-red-800">{error}</p>
						</div>
					</div>
				{/if}

				<div>
					{#if useEmail}
						<label for="email" class={labelClasses}>Email address</label>
						<input
							id="email"
							name="email"
							type="email"
							autocomplete="email"
							required
							bind:value={email}
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
							bind:value={mobile}
							class={inputClasses}
							placeholder="Enter your mobile number"
						/>
					{/if}
				</div>

				{#each formFields as field}
					<div>
						<label for={field.id} class={labelClasses}>{field.label}</label>
						<input
							id={field.id}
							name={field.id}
							type={field.type}
							autocomplete={field.autocomplete}
							required
							value={field.bind()}
							on:input={(e) => field.set((e.target as HTMLInputElement).value)}
							class={inputClasses}
							placeholder={field.placeholder}
						/>
					</div>
				{/each}

				<div>
					<button
						type="submit"
						disabled={loading || (!email && !mobile) || !password || !confirmPassword}
						class={primaryButtonClasses}
					>
						{#if loading}
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
