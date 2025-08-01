<script lang="ts">
  import { fly } from 'svelte/transition';
  import { toast } from './store.js';

  interface Props {
    data: App.ToastData;
  }
  let { data }: Props = $props();

  let hovering = $state(false);

  // pause / resume timer
  $effect(() => {
    if (!data.pauseOnHover) return;
    if (hovering) {
      clearTimeout((data as any)._timer);
      data.remaining -= Date.now() - data.createdAt;
    } else {
      if (data.remaining <= 0) {
        toast.remove(data.id);
        return;
      }
      (data as any)._timer = setTimeout(() => toast.remove(data.id), data.remaining);
      data.createdAt = Date.now();
    }
  });

  const icons: Record<App.ToastData['variant'], string> = {
    info: 'ℹ',
    success: '✓',
    warning: '⚠',
    error: '✕'
  };

  const variantClasses: Record<App.ToastData['variant'], string> = {
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
    success:
      'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200',
    warning:
      'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
    error:
      'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200'
  };

  const iconClasses: Record<App.ToastData['variant'], string> = {
    info: 'bg-blue-100 text-blue-600 dark:bg-blue-800/30 dark:text-blue-400',
    success: 'bg-green-100 text-green-600 dark:bg-green-800/30 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-800/30 dark:text-yellow-400',
    error: 'bg-red-100 text-red-600 dark:bg-red-800/30 dark:text-red-400'
  };

  const accentClasses: Record<App.ToastData['variant'], string> = {
    info: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500'
  };
</script>

<div
  role="status"
  class="pointer-events-auto relative flex max-w-md min-w-80 items-center gap-3 overflow-hidden rounded-xl border p-4 shadow-lg backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl {variantClasses[
    data.variant
  ]}"
  onmouseenter={() => (hovering = true)}
  onmouseleave={() => (hovering = false)}
  transition:fly={{ y: -30, duration: 300 }}
>
  <!-- Accent border -->
  <div class="absolute top-0 right-0 left-0 h-0.5 {accentClasses[data.variant]}"></div>

  <!-- Icon -->
  <div
    class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold {iconClasses[
      data.variant
    ]}"
  >
    {icons[data.variant]}
  </div>

  <!-- Message -->
  <div class="flex-1 text-sm leading-relaxed font-medium break-words">
    {data.message}
  </div>

  <!-- Close button -->
  <button
    aria-label="Close notification"
    onclick={() => toast.remove(data.id)}
    class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-lg leading-none opacity-60 transition-all duration-150 hover:bg-black/10 hover:opacity-100 focus:ring-2 focus:ring-current focus:ring-offset-2 focus:outline-none dark:hover:bg-white/10"
  >
    ×
  </button>
</div>
