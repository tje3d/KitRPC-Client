<script lang="ts">
  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let disabled: boolean = false;
  export let loading: boolean = false;
  export let loadingText: string = 'Loading...';
  export let onClick: (() => void) | undefined = undefined;

  function handleClick() {
    if (onClick && !disabled && !loading) {
      onClick();
    }
  }

  $: buttonClasses = `
		w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-2xl shadow-sm text-sm font-medium text-white
		bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700
		focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
		transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
		${disabled || loading ? 'opacity-50 cursor-not-allowed hover:scale-100' : ''}
	`.trim();
</script>

<button {type} {disabled} class={buttonClasses} on:click={handleClick}>
  {#if loading}
    <span class="icon-[solar--refresh-linear] mr-2 h-4 w-4 animate-spin"></span>
    {loadingText}
  {:else}
    <slot name="icon" />
    <slot />
  {/if}
</button>
