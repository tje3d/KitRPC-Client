<script lang="ts">
	let email = '';
	let mobile = '';
	let password = '';
	let useEmail = true;
	let error = '';
	let loading = false;

	const inputClasses =
		'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none';
	const toggleButtonClasses = 'rounded-md px-4 py-2 text-sm font-medium transition-colors';
	const activeToggleClasses = `${toggleButtonClasses} bg-white text-gray-900 shadow-sm`;
	const inactiveToggleClasses = `${toggleButtonClasses} text-gray-500 hover:text-gray-700`;

	// Toggle button data structure
	const toggleButtons = [
		{ label: 'Email', isActive: () => useEmail },
		{ label: 'Mobile', isActive: () => !useEmail }
	];

	async function handleLogin() {
		// ...
	}

	function toggleLoginMethod() {
		useEmail = !useEmail;
		email = '';
		mobile = '';
		error = '';
	}
</script>

<svelte:head>
	<title>Login - Todo Manager</title>
</svelte:head>

<div
	class="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 px-4"
>
	<div class="w-full max-w-md space-y-8">
		<div class="text-center">
			<h2 class="text-3xl font-bold text-gray-900">Sign in to your account</h2>
			<p class="mt-2 text-sm text-gray-600">
				Or
				<a href="/register" class="font-medium text-blue-600 hover:text-blue-500">
					create a new account
				</a>
			</p>
		</div>

		<div class="rounded-xl border border-gray-200 bg-white p-8 shadow-lg">
			<form on:submit|preventDefault={handleLogin} class="space-y-6">
				<!-- Login method toggle -->
				<div class="flex justify-center">
					<div class="flex rounded-lg bg-gray-100 p-1">
						{#each toggleButtons as button}
							<button
								type="button"
								on:click={toggleLoginMethod}
								class={button.isActive() ? activeToggleClasses : inactiveToggleClasses}
							>
								{button.label}
							</button>
						{/each}
					</div>
				</div>

				{#if error}
					<div class="rounded-md border border-red-200 bg-red-50 p-4">
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
						<label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
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
						<label for="mobile" class="block text-sm font-medium text-gray-700">Mobile number</label
						>
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

				<div>
					<label for="password" class="block text-sm font-medium text-gray-700">Password</label>
					<input
						id="password"
						name="password"
						type="password"
						autocomplete="current-password"
						required
						bind:value={password}
						class={inputClasses}
						placeholder="Enter your password"
					/>
				</div>

				<div>
					<button
						type="submit"
						disabled={loading || (!email && !mobile) || !password}
						class="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-400"
					>
						{#if loading}
							<svg
								class="mr-3 -ml-1 h-5 w-5 animate-spin text-white"
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
							Signing in...
						{:else}
							Sign in
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
</div>
