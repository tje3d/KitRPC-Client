<script lang="ts">
  export let id: string;
  export let name: string = id;
  export let label: string;
  export let checked: boolean = false;
  export let disabled: boolean = false;
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let variant: 'primary' | 'secondary' = 'primary';

  // Size configurations
  const sizeClasses = {
    sm: {
      checkbox: 'h-4 w-4',
      icon: 'h-3 w-3 left-0.5 top-0.5',
      label: 'text-xs'
    },
    md: {
      checkbox: 'h-5 w-5',
      icon: 'h-4 w-4 left-0.5 top-0.5',
      label: 'text-sm'
    },
    lg: {
      checkbox: 'h-6 w-6',
      icon: 'h-5 w-5 left-0.5 top-0.5',
      label: 'text-base'
    }
  };

  // Variant configurations
  const variantClasses = {
    primary: {
      base: 'border-gray-300 checked:border-green-500 checked:bg-gradient-to-br checked:from-green-500 checked:to-emerald-600 hover:border-green-400 focus:ring-green-500/20',
      label: 'text-gray-700 group-hover:text-gray-900'
    },
    secondary: {
      base: 'border-gray-300 checked:border-blue-500 checked:bg-gradient-to-br checked:from-blue-500 checked:to-blue-600 hover:border-blue-400 focus:ring-blue-500/20',
      label: 'text-gray-700 group-hover:text-gray-900'
    }
  };

  $: checkboxClasses = `
		peer cursor-pointer appearance-none rounded-lg border-2 bg-white/50 backdrop-blur-sm transition-all duration-200 focus:ring-2 focus:ring-offset-2
		${sizeClasses[size].checkbox}
		${variantClasses[variant].base}
		${disabled ? 'opacity-50 cursor-not-allowed' : ''}
	`;

  $: iconClasses = `
		pointer-events-none absolute text-white opacity-0 transition-opacity duration-200 peer-checked:opacity-100
		${sizeClasses[size].icon}
	`;

  $: labelClasses = `
		cursor-pointer select-none font-medium transition-colors ps-2 pb-1.5
		${sizeClasses[size].label}
		${variantClasses[variant].label}
		${disabled ? 'opacity-50 cursor-not-allowed' : ''}
	`;
</script>

<div class="group flex items-center">
  <div class="relative">
    <input {id} {name} type="checkbox" bind:checked {disabled} class={checkboxClasses} on:change />
    <svg class={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
    </svg>
  </div>
  <label for={id} class={labelClasses}>
    {label}
  </label>
</div>
