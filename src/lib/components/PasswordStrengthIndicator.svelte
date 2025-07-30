<script lang="ts">
  import { fade } from 'svelte/transition';

  export let password: string = '';

  function calculatePasswordStrength(password: string): {
    score: number;
    label: string;
    color: string;
  } {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;

    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const colors = [
      'bg-red-500',
      'bg-orange-500',
      'bg-yellow-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-teal-500'
    ];

    return {
      score,
      label: labels[score] || 'Very Weak',
      color: colors[score] || 'bg-red-500'
    };
  }

  $: passwordStrength = calculatePasswordStrength(password);
</script>

{#if password}
  <div class="space-y-2" in:fade={{ duration: 200 }}>
    <div class="flex items-center justify-between text-xs">
      <span class="text-gray-600">Password strength</span>
      <span
        class="font-medium {passwordStrength.score >= 3
          ? 'text-green-600'
          : passwordStrength.score >= 2
            ? 'text-yellow-600'
            : 'text-red-600'}"
      >
        {passwordStrength.label}
      </span>
    </div>
    <div class="flex space-x-1">
      {#each Array(5) as _, i}
        <div class="h-1 flex-1 rounded-full bg-gray-200">
          <div
            class="h-full rounded-full transition-all duration-300 {i < passwordStrength.score
              ? passwordStrength.color
              : ''}"
          ></div>
        </div>
      {/each}
    </div>
  </div>
{/if}
