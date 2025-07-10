# tRPC Request Helpers

This directory contains helpers for managing tRPC requests with RxJS observables, providing a reactive and type-safe way to handle API calls in your SvelteKit application.

## Files Overview

- `useTrpcRequest.helper.ts` - Main tRPC request wrapper with RxJS integration
- `useRequest.helper.ts` - Legacy HTTP-based request wrapper (kept for compatibility)
- `trpcRequestExamples.ts` - Comprehensive examples and migration guide
- `localStorage.helper.ts` - Local storage utilities for caching
- `rxjs.helper.ts` - RxJS utilities and custom operators

## Quick Start

### Basic Query

```typescript
import { useTrpcRequest, createTrpcRequestFnNoParams } from '$lib/helpers/useRequest.helper';
import { trpc } from '$lib/trpc/client';
import { page } from '$app/stores';
import { get } from 'svelte/store';

// Create a request wrapper
const greetingRequest = useTrpcRequest(
	createTrpcRequestFnNoParams(() => {
		const pageStore = get(page);
		return trpc(pageStore).greeting.query();
	}),
	{
		cacheResponse: true,
		localStorageKey: 'greeting-cache'
	}
);

// Subscribe to results
greetingRequest.responseSuccess.subscribe((greeting) => {
	console.log('Greeting:', greeting);
});

// Subscribe to loading state
greetingRequest.loading.subscribe((isLoading) => {
	console.log('Loading:', isLoading);
});

// Subscribe to errors
greetingRequest.errorMessage.subscribe((error) => {
	if (error) console.error('Error:', error);
});

// Trigger the request
greetingRequest.request();
```

### Query with Parameters

```typescript
interface TodoFilters {
	completed?: boolean;
	limit?: number;
}

const filteredTodosRequest = useTrpcRequest(
	createTrpcRequestFn((filters: TodoFilters) => {
		const pageStore = get(page);
		return trpc(pageStore).todos.getFiltered.query(filters);
	}),
	{
		cacheResponse: true,
		retryCount: 3
	}
);

// Trigger with parameters
filteredTodosRequest.request({ completed: false, limit: 10 });
```

### Mutations

```typescript
interface CreateTodoInput {
	text: string;
}

const createTodoRequest = useTrpcRequest(
	createTrpcRequestFn((input: CreateTodoInput) => {
		const pageStore = get(page);
		return trpc(pageStore).todos.add.mutate(input);
	}),
	{
		retryCount: 1,
		cacheResponse: false,
		requestOnSubscribe: false
	}
);

createTodoRequest.responseSuccess.subscribe(() => {
	console.log('Todo created successfully!');
	// Refresh other data if needed
});

createTodoRequest.request({ text: 'New todo item' });
```

## Configuration Options

### TrpcRequestWrapOptions

```typescript
interface TrpcRequestWrapOptions {
	// Polling interval in milliseconds
	interval?: number;

	// Retry configuration
	retryDelay?: number; // Initial delay between retries (default: 3000ms)
	retryCount?: number; // Number of retry attempts (default: 3)
	retryMaxDelay?: number; // Maximum delay between retries (default: 60000ms)

	// Caching
	cacheResponse?: boolean; // Whether to cache responses (default: true)
	startWithCache?: boolean; // Start with cached data if available (default: true)
	localStorageKey?: string; // Key for localStorage caching

	// Behavior
	requestOnSubscribe?: boolean; // Auto-trigger on subscription (default: true)
	global?: boolean; // Use global sharing (default: false)

	// Validation and conditions
	validateResponse?: (response: any) => boolean;
	shouldTrigger?: Observable<boolean>; // Conditional triggering
	initialData?: any; // Initial data to start with

	// Error handling
	extractErrorMessage?: (error: TRPCClientError<any>) => string | undefined;
}
```

## Error Handling

The tRPC request helper provides comprehensive error handling with Persian error messages:

```typescript
const request = useTrpcRequest(createTrpcRequestFn(myTrpcCall), {
	extractErrorMessage: (error) => {
		// Custom error message extraction
		if (error.data?.code === 'BAD_REQUEST') {
			return 'داده‌های ورودی نامعتبر است';
		}
		return undefined; // Use default error handling
	}
});

// Subscribe to error messages
request.errorMessage.subscribe((error) => {
	if (error) {
		// Show error to user
		showToast(error, 'error');
	}
});

// Subscribe to error objects for detailed handling
request.error$.subscribe((error) => {
	if (error) {
		console.error('Detailed error:', error.data);
	}
});
```

### Built-in Error Messages

The helper automatically provides Persian error messages for common tRPC error codes:

- `UNAUTHORIZED`: "شما مجاز به انجام این عملیات نیستید. لطفاً وارد شوید"
- `FORBIDDEN`: "شما دسترسی لازم برای انجام این عملیات را ندارید"
- `NOT_FOUND`: "اطلاعات مورد نظر یافت نشد"
- `CONFLICT`: "تداخل در اطلاعات. لطفاً مجدد تلاش کنید"
- `BAD_REQUEST`: "اطلاعات ارسالی نامعتبر است"
- `TIMEOUT`: "زمان انتظار تمام شد. لطفاً مجدد تلاش کنید"
- `TOO_MANY_REQUESTS`: "تعداد درخواست‌ها بیش از حد مجاز است. لطفاً کمی صبر کنید"
- `INTERNAL_SERVER_ERROR`: "خطای داخلی سرور. لطفاً بعداً تلاش کنید"

## Advanced Patterns

### Polling/Real-time Updates

```typescript
const realtimeDataRequest = useTrpcRequest(
	createTrpcRequestFnNoParams(() => {
		const pageStore = get(page);
		return trpc(pageStore).stats.getRealtime.query();
	}),
	{
		interval: 5000, // Poll every 5 seconds
		cacheResponse: false
	}
);

// Start polling
realtimeDataRequest.request();
```

### Conditional Requests

```typescript
const isUserLoggedIn$ = new BehaviorSubject<boolean>(false);

const userDataRequest = useTrpcRequest(
	createTrpcRequestFnNoParams(() => {
		const pageStore = get(page);
		return trpc(pageStore).user.getProfile.query();
	}),
	{
		shouldTrigger: isUserLoggedIn$, // Only request when logged in
		cacheResponse: true
	}
);

// This will trigger the request
isUserLoggedIn$.next(true);
```

### Global Monitoring

```typescript
import { trpcNetworkErrors$, trpcApiResponses$ } from '$lib/helpers/useRequest.helper';

// Monitor all tRPC errors globally
trpcNetworkErrors$.subscribe((error) => {
	console.error('Global tRPC Error:', error);
	// Show global error notification
});

// Monitor all tRPC responses globally
trpcApiResponses$.subscribe((response) => {
	console.log('Global tRPC Response:', response);
	// Log analytics, update global state, etc.
});
```

## Migration from HTTP-based useRequest

### Before (HTTP-based)

```typescript
import { useRequest, ApiService } from '$lib/helpers/useRequest.helper';

const todosRequest = useRequest((params) => ApiService.get('/api/todos', params), {
	cacheResponse: true,
	successStatusCodes: [200]
});

todosRequest.responseSuccess.subscribe((response) => {
	console.log('Todos:', response.response); // Need to access .response
});

todosRequest.request({ limit: 10 });
```

### After (tRPC-based)

```typescript
import { useTrpcRequest, createTrpcRequestFn } from '$lib/helpers/useRequest.helper';
import { trpc } from '$lib/trpc/client';

const todosRequest = useTrpcRequest(
	createTrpcRequestFn((params) => {
		const pageStore = get(page);
		return trpc(pageStore).todos.getAll.query(params);
	}),
	{
		cacheResponse: true
		// No need for successStatusCodes - tRPC handles this
	}
);

todosRequest.responseSuccess.subscribe((todos) => {
	console.log('Todos:', todos); // Direct access to data
});

todosRequest.request({ limit: 10 });
```

## Benefits of tRPC Integration

1. **Type Safety**: End-to-end TypeScript types from server to client
2. **Better Error Handling**: Structured error codes and messages
3. **Automatic Serialization**: No manual JSON parsing
4. **Built-in Validation**: Zod schemas ensure data integrity
5. **Consistent API**: Same patterns across all endpoints
6. **Better DX**: IntelliSense and auto-completion
7. **Persian Error Messages**: User-friendly error messages in Persian

## Best Practices

1. **Use caching for queries**: Set `cacheResponse: true` for data that doesn't change frequently
2. **Disable caching for mutations**: Set `cacheResponse: false` for create/update/delete operations
3. **Set appropriate retry counts**: Use lower retry counts for mutations, higher for queries
4. **Use conditional requests**: Leverage `shouldTrigger` for user-dependent data
5. **Handle errors gracefully**: Always subscribe to `errorMessage` and show user-friendly messages
6. **Monitor globally**: Use global error and response streams for analytics and debugging
7. **Cache with keys**: Use meaningful `localStorageKey` values for better cache management

For more examples, see `trpcRequestExamples.ts` in this directory.
