<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { authUser, isLoggedIn } from '$lib/flow/auth.flow';
	import { subscribe } from '$lib/helpers/svelte-rxjs.helper';
	import { fade, fly } from 'svelte/transition';

	// Subscribe to authentication state
	subscribe(isLoggedIn, (loggedIn) => {
		if (!loggedIn && browser) {
			goto('/login');
		}
	});

	// Get current time for greeting
	function getGreeting() {
		const hour = new Date().getHours();
		if (hour < 12) return 'Good morning';
		if (hour < 17) return 'Good afternoon';
		return 'Good evening';
	}

	// Get user's display name
	function getUserDisplayName(user?: App.AuthUser) {
		if (!user) return 'User';
		return 'User';
	}
</script>

{#if $isLoggedIn && $authUser}
	<div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
		<div class="container mx-auto px-4 py-12">
			<!-- Welcome Header -->
			<div class="mb-12 text-center" in:fade={{ duration: 600, delay: 200 }}>
				<h1 class="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
					{getGreeting()}, {getUserDisplayName($authUser)}! 👋
				</h1>
				<p class="mx-auto max-w-2xl text-xl text-gray-600">
					Welcome back to KitRPC. We're glad to see you again.
				</p>
			</div>

			<!-- Welcome Cards -->
			<div class="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
				<!-- Quick Stats Card -->
				<div
					class="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl"
					in:fly={{ y: 30, duration: 500, delay: 400 }}
				>
					<div class="mb-4 flex items-center">
						<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
							<svg
								class="h-6 w-6 text-blue-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
								></path>
							</svg>
						</div>
						<h3 class="ml-3 text-lg font-semibold text-gray-900">Dashboard</h3>
					</div>
					<p class="mb-4 text-gray-600">View your analytics and performance metrics</p>
					<button class="font-medium text-blue-600 transition-colors hover:text-blue-700">
						View Dashboard →
					</button>
				</div>

				<!-- API Management Card -->
				<div
					class="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl"
					in:fly={{ y: 30, duration: 500, delay: 500 }}
				>
					<div class="mb-4 flex items-center">
						<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
							<svg
								class="h-6 w-6 text-green-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
								></path>
							</svg>
						</div>
						<h3 class="ml-3 text-lg font-semibold text-gray-900">API Management</h3>
					</div>
					<p class="mb-4 text-gray-600">Manage your tRPC endpoints and configurations</p>
					<button class="font-medium text-green-600 transition-colors hover:text-green-700">
						Manage APIs →
					</button>
				</div>

				<!-- Settings Card -->
				<div
					class="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl"
					in:fly={{ y: 30, duration: 500, delay: 600 }}
				>
					<div class="mb-4 flex items-center">
						<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
							<svg
								class="h-6 w-6 text-purple-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
								></path>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
								></path>
							</svg>
						</div>
						<h3 class="ml-3 text-lg font-semibold text-gray-900">Settings</h3>
					</div>
					<p class="mb-4 text-gray-600">Configure your account and preferences</p>
					<button class="font-medium text-purple-600 transition-colors hover:text-purple-700">
						Open Settings →
					</button>
				</div>
			</div>

			<!-- Recent Activity Section -->
			<div
				class="mx-auto mt-12 max-w-4xl rounded-2xl border border-gray-100 bg-white p-8 shadow-lg"
				in:fly={{ y: 30, duration: 500, delay: 700 }}
			>
				<h2 class="mb-6 text-2xl font-bold text-gray-900">Getting Started</h2>
				<div class="grid gap-6 md:grid-cols-2">
					<div class="space-y-4">
						<h3 class="text-lg font-semibold text-gray-800">Quick Actions</h3>
						<ul class="space-y-3">
							<li class="flex items-center text-gray-600">
								<svg class="mr-3 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
									<path
										fill-rule="evenodd"
										d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
										clip-rule="evenodd"
									></path>
								</svg>
								Explore the API documentation
							</li>
							<li class="flex items-center text-gray-600">
								<svg class="mr-3 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
									<path
										fill-rule="evenodd"
										d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
										clip-rule="evenodd"
									></path>
								</svg>
								Create your first tRPC procedure
							</li>
							<li class="flex items-center text-gray-600">
								<svg class="mr-3 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
									<path
										fill-rule="evenodd"
										d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
										clip-rule="evenodd"
									></path>
								</svg>
								Set up your development environment
							</li>
						</ul>
					</div>
					<div class="space-y-4">
						<h3 class="text-lg font-semibold text-gray-800">Resources</h3>
						<ul class="space-y-3">
							<li>
								<a href="#" class="text-blue-600 transition-colors hover:text-blue-700">
									📚 Documentation
								</a>
							</li>
							<li>
								<a href="#" class="text-blue-600 transition-colors hover:text-blue-700">
									🎯 Examples & Tutorials
								</a>
							</li>
							<li>
								<a href="#" class="text-blue-600 transition-colors hover:text-blue-700">
									💬 Community Support
								</a>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
