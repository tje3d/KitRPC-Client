<script lang="ts">
  import { quintOut } from 'svelte/easing';
  import { fly } from 'svelte/transition';

  // Props
  export let title: string;
  export let subtitle: string;
  export let iconClass: string;
  export let linkText: string = '';
  export let linkHref: string = '';
  export let linkLabel: string = '';
</script>

<div
  class="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4"
>
  <!-- Background decoration -->
  <div class="pointer-events-none absolute inset-0 overflow-hidden">
    <div
      class="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-600/20 blur-3xl"
    ></div>
    <div
      class="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-tr from-indigo-400/20 to-pink-600/20 blur-3xl"
    ></div>
  </div>

  <div class="relative z-10 w-full max-w-md" in:fly={{ y: 20, duration: 600, easing: quintOut }}>
    <!-- Header -->
    <div class="mb-8 text-center">
      <div
        class="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg"
      >
        <span class="{iconClass} h-8 w-8 text-white"></span>
      </div>
      <h1 class="mb-2 text-3xl font-bold text-gray-900">{title}</h1>
      <p class="text-gray-600">
        {subtitle}
        {#if linkText && linkHref && linkLabel}
          <a
            href={linkHref}
            class="font-semibold text-blue-600 transition-colors hover:text-blue-700"
          >
            {linkText}
          </a>
        {/if}
      </p>
    </div>

    <!-- Main Form Card -->
    <div
      class="space-y-6 rounded-3xl border border-white/20 bg-white/80 p-8 shadow-2xl backdrop-blur-xl"
    >
      <slot />
    </div>

    <!-- Footer Content -->
    <slot name="footer-content" />
  </div>
</div>
