# tRPC useTrpcRequest Implementation Rules

## Project Context
- SvelteKit project with tRPC and RxJS
- Use the `useTrpcRequest` helper for all tRPC operations
- Follow reactive programming patterns with RxJS observables

## Core Imports Pattern
Always include these imports when implementing tRPC functionality:

```typescript
import { page } from '$app/state';
import { shareIt } from '$lib/helpers/rxjs.helper';
import { createTrpcRequestFn, useTrpcRequest } from '$lib/helpers/useTrpcRequest.helper';
import { trpc } from '$lib/trpc/client';
import { BehaviorSubject, combineLatest, map, startWith } from 'rxjs';
import { onMount } from 'svelte';
```

## Request Wrapper Patterns

### Query Pattern (GET operations)
```typescript
const load{Entity}Request = useTrpcRequest(
	createTrpcRequestFn(() => {
		return trpc(page).{router}.{procedure}.query();
	}),
	{
		cacheResponse: true,
		localStorageKey: '{entity}-cache',
		retryCount: 3
	}
);
```

### Query with Parameters Pattern
```typescript
const load{Entity}Request = useTrpcRequest(
	createTrpcRequestFn((params: {ParamType}) => {
		return trpc(page).{router}.{procedure}.query(params);
	}),
	{
		cacheResponse: true,
		retryCount: 3
	}
);
```

### Mutation Pattern (POST/PUT/DELETE operations)
```typescript
const {action}{Entity}Request = useTrpcRequest(
	createTrpcRequestFn((input: {InputType}) => {
		return trpc(page).{router}.{procedure}.mutate(input);
	})
);
```

## Observable Streams Pattern

### Data Stream
```typescript
const {entity}$ = load{Entity}Request.responseSuccess.pipe(
	startWith([]),
	map((r) => r || []),
	shareIt()
);
```

### Loading States
```typescript
const loading$ = load{Entity}Request.loading.pipe(shareIt());
const {action}Loading$ = {action}{Entity}Request.loading.pipe(shareIt());
```

### Error States
```typescript
const errorMessage$ = load{Entity}Request.errorMessage.pipe(shareIt());
const {action}Error$ = {action}{Entity}Request.errorMessage.pipe(shareIt());
```

### Derived Data Streams
```typescript
const filtered{Entity}$ = {entity}$.pipe(
	map((items) => items.filter(item => {condition})),
	shareIt()
);

const {entity}Stats$ = combineLatest([{entity}$, filtered{Entity}$]).pipe(
	map(([all, filtered]) => ({
		total: all.length,
		filtered: filtered.length,
		percentage: all.length > 0 ? Math.round((filtered.length / all.length) * 100) : 0
	})),
	shareIt()
);
```

## Form State Management Pattern
```typescript
const new{Entity}Data$ = new BehaviorSubject<{EntityType}>({defaultValues});
const editing{Entity}Id$ = new BehaviorSubject<string | null>(null);
const editing{Entity}Data$ = new BehaviorSubject<{EntityType}>({defaultValues});
```

## Actions Pattern
```typescript
const {entity}Actions = {
	load{Entity}() {
		load{Entity}Request.request(undefined);
	},

	async create{Entity}(data: {EntityType}) {
		if (!{validation}) return;

		try {
			await create{Entity}Request.request(data);
			new{Entity}Data$.next({defaultValues});
			this.load{Entity}();
		} catch (error) {
			console.error('Failed to create {entity}:', error);
		}
	},

	async update{Entity}(id: string, data: {EntityType}) {
		if (!id || !{validation}) return;

		try {
			await update{Entity}Request.request({ id, ...data });
			this.cancelEdit();
			this.load{Entity}();
		} catch (error) {
			console.error('Failed to update {entity}:', error);
		}
	},

	async delete{Entity}(id: string) {
		try {
			await delete{Entity}Request.request(id);
			this.load{Entity}();
		} catch (error) {
			console.error('Failed to delete {entity}:', error);
		}
	},

	startEdit({entity}: {EntityType}) {
		editing{Entity}Id$.next({entity}.id);
		editing{Entity}Data$.next({entity});
	},

	cancelEdit() {
		editing{Entity}Id$.next(null);
		editing{Entity}Data$.next({defaultValues});
	},

	clearErrors() {
		load{Entity}Request.clearError();
		create{Entity}Request.clearError();
		update{Entity}Request.clearError();
		delete{Entity}Request.clearError();
	},

	update{Field}(value: {FieldType}) {
		const current = new{Entity}Data$.value;
		new{Entity}Data$.next({ ...current, {field}: value });
	}
};
```

## Component Lifecycle Pattern
```typescript
onMount(() => {
	{entity}Actions.load{Entity}();
});
```

## Template Patterns

### Loading State Display
```svelte
{#if $loading$}
	<div class="animate-pulse space-y-4">
		{#each Array(3) as _}
			<div class="h-16 bg-gray-200 rounded"></div>
		{/each}
	</div>
{/if}
```

### Error Display Pattern
```svelte
{#if $errorMessage$}
	<div class="bg-red-50 border border-red-200 rounded-lg p-4">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				<svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
				</svg>
				<p class="text-red-700">{$errorMessage$}</p>
			</div>
			<button
				onclick={() => load{Entity}Request.clearError()}
				class="text-red-400 hover:text-red-600"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
				</svg>
			</button>
		</div>
	</div>
{/if}
```

### Empty State Pattern
```svelte
{#if ${entity}$.length === 0 && !$loading$}
	<div class="text-center py-12">
		<div class="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
			<svg class="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="{iconPath}"></path>
			</svg>
		</div>
		<h3 class="text-lg font-medium text-gray-800 mb-2">No {entities} yet</h3>
		<p class="text-gray-600">Create your first {entity} to get started.</p>
	</div>
{/if}
```

### Form Input Pattern
```svelte
<input
	type="text"
	value={${field}$}
	oninput={(e) => {entity}Actions.update{Field}((e.target as HTMLInputElement).value)}
	placeholder="Enter {field}..."
	class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
/>
```

### Action Button Pattern
```svelte
<button
	onclick={() => {entity}Actions.{action}({params})}
	disabled={${actionLoading}$ || !{condition}}
	class="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
>
	{#if ${actionLoading}$}
		<div class="flex items-center gap-2">
			<div class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
			{ActionText}ing...
		</div>
	{:else}
		{ActionText}
	{/if}
</button>
```

### Data List Pattern
```svelte
{#each ${entity}$ as item (item.id)}
	<div class="group border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
		<!-- Item content -->
		<div class="flex items-center justify-between">
			<span class="font-medium">{item.name}</span>
			<div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
				<button
					onclick={() => {entity}Actions.startEdit(item)}
					class="text-blue-600 hover:text-blue-800"
				>
					Edit
				</button>
				<button
					onclick={() => {entity}Actions.delete{Entity}(item.id)}
					disabled={$deleteLoading$}
					class="text-red-600 hover:text-red-800 disabled:opacity-50"
				>
					Delete
				</button>
			</div>
		</div>
	</div>
{/each}
```

## Search/Filter Pattern
```typescript
const searchTerm$ = new BehaviorSubject<string>('');

const filtered{Entity}$ = combineLatest([{entity}$, searchTerm$]).pipe(
	map(([items, term]) => {
		if (!term.trim()) return items;
		return items.filter(item => 
			item.name.toLowerCase().includes(term.toLowerCase())
		);
	}),
	shareIt()
);
```

## Advanced Patterns

### Conditional Requests
```typescript
const conditional{Entity}Request = useTrpcRequest(
	createTrpcRequestFn((params: {ParamType}) => {
		return trpc(page).{router}.{procedure}.query(params);
	}),
	{
		shouldTrigger: condition$.pipe(map(condition => !!condition))
	}
);
```

### Polling Pattern
```typescript
const live{Entity}Request = useTrpcRequest(
	createTrpcRequestFn(() => {
		return trpc(page).{router}.{procedure}.query();
	}),
	{
		interval: 5000,
		requestOnSubscribe: true,
		shouldTrigger: isVisible$
	}
);
```

### Master-Detail Pattern
```typescript
const selectedId$ = new BehaviorSubject<string | null>(null);

const detail{Entity}Request = useTrpcRequest(
	createTrpcRequestFn((id: string) => {
		return trpc(page).{router}.getById.query({ id });
	}),
	{
		shouldTrigger: selectedId$.pipe(map(id => !!id))
	}
);

selectedId$.subscribe(id => {
	if (id) detail{Entity}Request.request(id);
});
```

## Keyboard Shortcuts Pattern
```typescript
const handleKeydown = (event: KeyboardEvent, action: () => void) => {
	if (event.key === 'Enter') {
		event.preventDefault();
		action();
	}
	if (event.key === 'Escape') {
		event.preventDefault();
		{entity}Actions.cancelEdit();
	}
};
```

## Best Practices

1. **Always use `shareIt()`** on observables with multiple subscribers
2. **Provide `startWith()`** for data streams to avoid undefined states
3. **Handle loading states** for better UX
4. **Clear errors** when appropriate
5. **Refresh data** after successful mutations
6. **Use caching** for expensive queries with `cacheResponse: true`
7. **Implement retry logic** with `retryCount`
8. **Extract error messages** for user-friendly feedback
9. **Use TypeScript** for type safety
10. **Follow consistent naming** conventions

## File Structure
```
src/routes/{feature}/
├── +page.svelte          # Main component
├── +page.server.ts       # Server-side logic (if needed)
└── components/           # Feature-specific components
    ├── {Feature}Form.svelte
    ├── {Feature}List.svelte
    └── {Feature}Item.svelte
```

## Variable Naming Conventions
- Requests: `{action}{Entity}Request`
- Observables: `{entity}$`, `{property}$`
- Actions: `{entity}Actions`
- Loading states: `{action}Loading$`
- Error states: `{action}Error$`
- Form data: `new{Entity}Data$`, `editing{Entity}Data$`