<script lang="ts">
  import PageWrapper from '$lib/components/PageWrapper.svelte';
  import { authUser, isLoggedIn } from '$lib/flow/auth.flow';
  import { fade, fly } from 'svelte/transition';

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

<PageWrapper
  title="KitRPC - Modern tRPC Development Platform"
  description="Build, manage, and scale your tRPC applications with ease. Join thousands of developers using KitRPC."
>
  {#if $isLoggedIn && $authUser}
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div class="container mx-auto px-4 py-12">
        <!-- Welcome Header -->
        <div
          class="mb-12 text-center"
          in:fade={{
            duration: 600,
            delay: 200
          }}
        >
          <h1 class="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
            {getGreeting()},
            {getUserDisplayName($authUser)}! 👋
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
            in:fly={{
              y: 30,
              duration: 500,
              delay: 400
            }}
          >
            <div class="mb-4 flex items-center">
              <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <span class="icon-[heroicons--chart-bar] h-6 w-6 text-blue-600"></span>
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
            in:fly={{
              y: 30,
              duration: 500,
              delay: 500
            }}
          >
            <div class="mb-4 flex items-center">
              <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                <span class="icon-[heroicons--command-line] h-6 w-6 text-green-600"></span>
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
            in:fly={{
              y: 30,
              duration: 500,
              delay: 600
            }}
          >
            <div class="mb-4 flex items-center">
              <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                <span class="icon-[heroicons--cog-6-tooth] h-6 w-6 text-purple-600"></span>
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
          in:fly={{
            y: 30,
            duration: 500,
            delay: 700
          }}
        >
          <h2 class="mb-6 text-2xl font-bold text-gray-900">Getting Started</h2>
          <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-4">
              <h3 class="text-lg font-semibold text-gray-800">Quick Actions</h3>
              <ul class="space-y-3">
                <li class="flex items-center text-gray-600">
                  <span class="icon-[heroicons--check] mr-3 h-5 w-5 text-green-500"></span>
                  Explore the API documentation
                </li>
                <li class="flex items-center text-gray-600">
                  <span class="icon-[heroicons--check] mr-3 h-5 w-5 text-green-500"></span>
                  Create your first tRPC procedure
                </li>
                <li class="flex items-center text-gray-600">
                  <span class="icon-[heroicons--check] mr-3 h-5 w-5 text-green-500"></span>
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
  {:else}
    <!-- Guest Landing Page -->
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div class="container mx-auto px-4 py-16">
        <!-- Hero Section -->
        <div
          class="mb-16 text-center"
          in:fade={{
            duration: 600,
            delay: 200
          }}
        >
          <h1 class="mb-6 text-5xl font-bold text-gray-900 md:text-6xl lg:text-7xl">
            Build <span class="text-blue-600">tRPC</span>
            APIs
            <br />
            <span class="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
              >Faster Than Ever</span
            >
          </h1>
          <p class="mx-auto max-w-3xl text-xl text-gray-600 md:text-2xl">
            KitRPC is the modern development platform that makes building, managing, and scaling
            tRPC applications effortless. Join thousands of developers who trust KitRPC.
          </p>

          <!-- CTA Buttons -->
          <div
            class="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            in:fade={{
              duration: 500,
              delay: 400
            }}
          >
            <a
              href="/register"
              class="rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200"
            >
              Get Started Free
            </a>
            <a
              href="/login"
              class="rounded-xl border border-gray-300 bg-white px-8 py-4 text-lg font-semibold text-gray-700 transition-all duration-300 hover:bg-gray-50 hover:shadow-lg"
            >
              Sign In
            </a>
          </div>
        </div>

        <!-- Features Grid -->
        <div class="mx-auto max-w-6xl">
          <h2 class="mb-12 text-center text-3xl font-bold text-gray-900">Why Choose KitRPC?</h2>

          <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <!-- Feature 1 -->
            <div
              class="rounded-2xl border border-gray-100 bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-xl"
              in:fly={{
                y: 30,
                duration: 500,
                delay: 500
              }}
            >
              <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-blue-100">
                <span class="icon-[heroicons--bolt] h-8 w-8 text-blue-600"></span>
              </div>
              <h3 class="mb-3 text-xl font-semibold text-gray-900">Lightning Fast</h3>
              <p class="text-gray-600">
                Type-safe APIs with automatic client generation. No more manual API documentation or
                client SDK maintenance.
              </p>
            </div>

            <!-- Feature 2 -->
            <div
              class="rounded-2xl border border-gray-100 bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-xl"
              in:fly={{
                y: 30,
                duration: 500,
                delay: 600
              }}
            >
              <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-green-100">
                <span class="icon-[heroicons--shield-check] h-8 w-8 text-green-600"></span>
              </div>
              <h3 class="mb-3 text-xl font-semibold text-gray-900">End-to-End Type Safety</h3>
              <p class="text-gray-600">
                Full TypeScript support from backend to frontend. Catch errors at compile time, not
                runtime.
              </p>
            </div>

            <!-- Feature 3 -->
            <div
              class="rounded-2xl border border-gray-100 bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-xl"
              in:fly={{
                y: 30,
                duration: 500,
                delay: 700
              }}
            >
              <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-purple-100">
                <span class="icon-[heroicons--rocket-launch] h-8 w-8 text-purple-600"></span>
              </div>
              <h3 class="mb-3 text-xl font-semibold text-gray-900">Zero Configuration</h3>
              <p class="text-gray-600">
                Get started in minutes with our intuitive setup. No complex configuration files or
                build tools required.
              </p>
            </div>

            <!-- Feature 4 -->
            <div
              class="rounded-2xl border border-gray-100 bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-xl"
              in:fly={{
                y: 30,
                duration: 500,
                delay: 800
              }}
            >
              <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-indigo-100">
                <span class="icon-[heroicons--users] h-8 w-8 text-indigo-600"></span>
              </div>
              <h3 class="mb-3 text-xl font-semibold text-gray-900">Team Collaboration</h3>
              <p class="text-gray-600">
                Share APIs with your team seamlessly. Built-in versioning and collaboration tools
                for modern teams.
              </p>
            </div>

            <!-- Feature 5 -->
            <div
              class="rounded-2xl border border-gray-100 bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-xl"
              in:fly={{
                y: 30,
                duration: 500,
                delay: 900
              }}
            >
              <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-red-100">
                <span class="icon-[heroicons--chart-bar] h-8 w-8 text-red-600"></span>
              </div>
              <h3 class="mb-3 text-xl font-semibold text-gray-900">Real-time Analytics</h3>
              <p class="text-gray-600">
                Monitor your API performance with detailed analytics and insights. Track usage,
                errors, and performance metrics.
              </p>
            </div>

            <!-- Feature 6 -->
            <div
              class="rounded-2xl border border-gray-100 bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-xl"
              in:fly={{
                y: 30,
                duration: 500,
                delay: 1000
              }}
            >
              <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-yellow-100">
                <span class="icon-[heroicons--code-bracket] h-8 w-8 text-yellow-600"></span>
              </div>
              <h3 class="mb-3 text-xl font-semibold text-gray-900">Developer Experience</h3>
              <p class="text-gray-600">
                Built by developers, for developers. Intuitive CLI tools, VS Code extensions, and
                excellent documentation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</PageWrapper>
