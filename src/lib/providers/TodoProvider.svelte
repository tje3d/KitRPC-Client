<script lang="ts">
	import { page } from '$app/state';
	import { shareIt } from '$lib/helpers/rxjs.helper';
	import { subscribe } from '$lib/helpers/svelte-rxjs.helper';
	import { createTrpcRequestFn, useTrpcRequest } from '$lib/helpers/useTrpcRequest.helper';
	import { trpc } from '$lib/trpc/client';
	import { combineLatest, map, startWith } from 'rxjs';

	// Callback props
	export let onAddSuccess: () => void;
	export let onUpdateSuccess: () => void;
	export let onToggleSuccess: () => void;
	export let onDeleteSuccess: () => void;

	// Load todos request
	const loadTodosRequest = useTrpcRequest(
		createTrpcRequestFn(() => {
			return trpc(page).todos.getAll.query();
		}),
		{
			cacheResponse: true,
			localStorageKey: 'todos-cache',
			retryCount: 3
		}
	);

	// Add todo request
	const addTodoRequest = useTrpcRequest(
		createTrpcRequestFn((text: string) => {
			return trpc(page).todos.add.mutate({ text: text.trim() });
		})
	);

	// Toggle todo request
	const toggleTodoRequest = useTrpcRequest(
		createTrpcRequestFn((id: string) => {
			return trpc(page).todos.toggle.mutate({ id });
		})
	);

	// Update todo request
	const updateTodoRequest = useTrpcRequest(
		createTrpcRequestFn((data: { id: string; text: string }) => {
			return trpc(page).todos.update.mutate(data);
		})
	);

	// Delete todo request
	const deleteTodoRequest = useTrpcRequest(
		createTrpcRequestFn((id: string) => {
			return trpc(page).todos.delete.mutate({ id });
		})
	);

	// State observables
	const todos$ = loadTodosRequest.responseSuccess.pipe(
		startWith([]),
		map((r) => r || []),
		shareIt()
	);

	// Derived observables for stats
	const completedTodos$ = todos$.pipe(
		map((todos) => todos.filter((todo) => todo.completed)),
		shareIt()
	);

	const remainingTodos$ = todos$.pipe(
		map((todos) => todos.filter((todo) => !todo.completed)),
		shareIt()
	);

	const todoStats$ = combineLatest([todos$, completedTodos$, remainingTodos$]).pipe(
		map(([todos, completed, remaining]) => ({
			total: todos.length,
			completed: completed.length,
			remaining: remaining.length
		})),
		shareIt()
	);

	// Loading states
	const loading$ = loadTodosRequest.loading;
	const addLoading$ = addTodoRequest.loading;
	const toggleLoading$ = toggleTodoRequest.loading;
	const updateLoading$ = updateTodoRequest.loading;
	const deleteLoading$ = deleteTodoRequest.loading;

	// Error states
	const errorMessage$ = loadTodosRequest.errorMessage;
	const addError$ = addTodoRequest.errorMessage;
	const toggleError$ = toggleTodoRequest.errorMessage;
	const updateError$ = updateTodoRequest.errorMessage;
	const deleteError$ = deleteTodoRequest.errorMessage;

	// Actions
	export function loadTodos() {
		loadTodosRequest.trigger.next(undefined);
	}

	async function addTodo(text: string) {
		if (!text.trim()) return;

		try {
			addTodoRequest.trigger.next(text.trim());
		} catch (error) {
			console.error('Failed to add todo:', error);
		}
	}

	async function toggleTodo(id: string) {
		try {
			toggleTodoRequest.trigger.next(id);
		} catch (error) {
			console.error('Failed to toggle todo:', error);
		}
	}

	function startEditing(
		todo: App.Todo,
		setEditingId: (id: string | null) => void,
		setEditingText: (text: string) => void
	) {
		setEditingId(todo.id);
		setEditingText(todo.text);
	}

	async function saveEdit(id: string, text: string) {
		if (!id || !text.trim()) return;

		try {
			updateTodoRequest.trigger.next({
				id,
				text: text.trim()
			});
		} catch (error) {
			console.error('Failed to update todo:', error);
		}
	}

	async function deleteTodo(id: string) {
		try {
			deleteTodoRequest.trigger.next(id);
		} catch (error) {
			console.error('Failed to delete todo:', error);
		}
	}

	function clearError() {
		loadTodosRequest.clearError();
		addTodoRequest.clearError();
		toggleTodoRequest.clearError();
		updateTodoRequest.clearError();
		deleteTodoRequest.clearError();
	}

	function clearAddError() {
		addTodoRequest.clearError();
	}

	function clearToggleError() {
		toggleTodoRequest.clearError();
	}

	function clearUpdateError() {
		updateTodoRequest.clearError();
	}

	function clearDeleteError() {
		deleteTodoRequest.clearError();
	}

	subscribe(addTodoRequest.responseSuccess, (r) => {
		if (!r) return;

		onAddSuccess();
	});

	subscribe(updateTodoRequest.responseSuccess, (r) => {
		if (!r) return;

		onUpdateSuccess();
	});

	subscribe(toggleTodoRequest.responseSuccess, (r) => {
		if (!r) return;

		onToggleSuccess();
	});

	subscribe(deleteTodoRequest.responseSuccess, (r) => {
		if (!r) return;

		onDeleteSuccess();
	});
</script>

<slot
	todos={$todos$}
	todoStats={$todoStats$}
	loading={$loading$}
	errorMessage={$errorMessage$}
	addLoading={$addLoading$}
	toggleLoading={$toggleLoading$}
	updateLoading={$updateLoading$}
	deleteLoading={$deleteLoading$}
	addError={$addError$}
	toggleError={$toggleError$}
	updateError={$updateError$}
	deleteError={$deleteError$}
	addSuccess={addTodoRequest.responseSuccess}
	updateSuccess={updateTodoRequest.responseSuccess}
	toggleSuccess={toggleTodoRequest.responseSuccess}
	deleteSuccess={deleteTodoRequest.responseSuccess}
	{loadTodos}
	{addTodo}
	{toggleTodo}
	{startEditing}
	{saveEdit}
	{deleteTodo}
	{clearError}
	{clearAddError}
	{clearToggleError}
	{clearUpdateError}
	{clearDeleteError}
/>
