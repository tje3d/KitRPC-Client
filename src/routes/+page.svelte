<script lang="ts">
	import { page } from '$app/state';
	import { shareIt } from '$lib/helpers/rxjs.helper';
	import { createTrpcRequestFn, useTrpcRequest } from '$lib/helpers/useTrpcRequest.helper';
	import { trpc } from '$lib/trpc/client';
	import { BehaviorSubject, combineLatest, map, startWith } from 'rxjs';
	import { onMount } from 'svelte';

	const cardClasses = 'rounded-xl border border-gray-200 bg-white shadow-lg';
	const errorCardClasses = 'rounded-lg border border-red-200 bg-red-50 p-3';
	const errorIconClasses = 'h-4 w-4 text-red-400';
	const errorTextClasses = 'text-sm text-red-700';
	const errorCloseButtonClasses = 'ml-auto text-red-400 hover:text-red-600';
	const primaryButtonClasses =
		'rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg disabled:cursor-not-allowed disabled:bg-gray-400';
	const inputClasses =
		'flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-lg transition-all outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500';
	const actionButtonClasses =
		'rounded-md px-3 py-1 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:bg-gray-400';
	const editButtonClasses = `${actionButtonClasses} bg-blue-600 hover:bg-blue-700`;
	const saveButtonClasses = `${actionButtonClasses} bg-green-600 hover:bg-green-700`;
	const cancelButtonClasses = `${actionButtonClasses} bg-gray-500 hover:bg-gray-600`;
	const deleteButtonClasses = `${actionButtonClasses} bg-red-600 hover:bg-red-700`;
	const spinnerClasses =
		'h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent';
	const smallSpinnerClasses =
		'h-3 w-3 animate-spin rounded-full border border-white border-t-transparent';

	// Stats card data structure
	const statsCards = [
		{
			label: 'Total Tasks',
			value: () => $todoStats$.total,
			color: 'blue',
			icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
		},
		{
			label: 'Completed',
			value: () => $todoStats$.completed,
			color: 'green',
			icon: 'M5 13l4 4L19 7'
		},
		{
			label: 'Remaining',
			value: () => $todoStats$.remaining,
			color: 'orange',
			icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
		}
	];

	// API requests
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

	const addTodoRequest = useTrpcRequest(
		createTrpcRequestFn((text: string) => {
			return trpc(page).todos.add.mutate({ text: text.trim() });
		})
	);

	const toggleTodoRequest = useTrpcRequest(
		createTrpcRequestFn((id: string) => {
			return trpc(page).todos.toggle.mutate({ id });
		})
	);

	const updateTodoRequest = useTrpcRequest(
		createTrpcRequestFn((data: { id: string; text: string }) => {
			return trpc(page).todos.update.mutate(data);
		})
	);

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
	const loading$ = loadTodosRequest.loading.pipe(shareIt());
	const errorMessage$ = loadTodosRequest.errorMessage.pipe(shareIt());
	const editingId$ = new BehaviorSubject<string | null>(null);
	const editingText$ = new BehaviorSubject<string>('');
	const newTodoText$ = new BehaviorSubject<string>('');

	// Loading states for individual operations
	const addLoading$ = addTodoRequest.loading.pipe(shareIt());
	const toggleLoading$ = toggleTodoRequest.loading.pipe(shareIt());
	const updateLoading$ = updateTodoRequest.loading.pipe(shareIt());
	const deleteLoading$ = deleteTodoRequest.loading.pipe(shareIt());

	// Error states for individual operations
	const addError$ = addTodoRequest.errorMessage.pipe(shareIt());
	const toggleError$ = toggleTodoRequest.errorMessage.pipe(shareIt());
	const updateError$ = updateTodoRequest.errorMessage.pipe(shareIt());
	const deleteError$ = deleteTodoRequest.errorMessage.pipe(shareIt());

	// Error display data structure
	const errorDisplays = [
		{ error$: () => $addError$, request: addTodoRequest, label: 'Add' },
		{ error$: () => $toggleError$, request: toggleTodoRequest, label: 'Toggle' },
		{ error$: () => $updateError$, request: updateTodoRequest, label: 'Update' },
		{ error$: () => $deleteError$, request: deleteTodoRequest, label: 'Delete' }
	];

	// Derived observables
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

	// Actions
	const todoActions = {
		loadTodos() {
			loadTodosRequest.request(undefined);
		},

		async addTodo(text: string) {
			if (!text.trim()) return;

			try {
				await addTodoRequest.request(text.trim());
				newTodoText$.next('');
				this.loadTodos();
			} catch (error) {
				console.error('Failed to add todo:', error);
			}
		},

		async toggleTodo(id: string) {
			try {
				await toggleTodoRequest.request(id);
				this.loadTodos();
			} catch (error) {
				console.error('Failed to toggle todo:', error);
			}
		},

		startEditing(todo: App.Todo) {
			editingId$.next(todo.id);
			editingText$.next(todo.text);
		},

		cancelEditing() {
			editingId$.next(null);
			editingText$.next('');
		},

		async saveEdit(id: string, text: string) {
			if (!id || !text.trim()) return;

			try {
				await updateTodoRequest.request({
					id,
					text: text.trim()
				});
				this.cancelEditing();
				this.loadTodos();
			} catch (error) {
				console.error('Failed to update todo:', error);
			}
		},

		async deleteTodo(id: string) {
			try {
				await deleteTodoRequest.request(id);
				this.loadTodos();
			} catch (error) {
				console.error('Failed to delete todo:', error);
			}
		},

		clearError() {
			loadTodosRequest.clearError();
			addTodoRequest.clearError();
			toggleTodoRequest.clearError();
			updateTodoRequest.clearError();
			deleteTodoRequest.clearError();
		},

		updateNewTodoText(text: string) {
			newTodoText$.next(text);
		},

		updateEditingText(text: string) {
			editingText$.next(text);
		}
	};

	const handleKeydown = (event: KeyboardEvent, action: () => void) => {
		if (event.key === 'Enter') {
			action();
		}
	};

	onMount(() => {
		todoActions.loadTodos();
	});
</script>

<svelte:head>
	<title>Professional Todo Manager</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
	<div class="mx-auto max-w-5xl px-6 py-8">
		<!-- Header -->
		<header class="mb-12 text-center">
			<h1 class="mb-3 text-5xl font-bold tracking-tight text-gray-800">Todo Manager</h1>
			<p class="text-xl font-medium text-gray-600">Stay organized and productive with your tasks</p>
		</header>

		<!-- Load Todos Error Display -->
		{#if $errorMessage$}
			<div
				class="animate-in slide-in-from-right-5 fade-in fixed top-4 right-4 z-50 max-w-md duration-300"
			>
				<div class="rounded-lg border border-red-200 bg-red-50 p-4 shadow-lg">
					<div class="flex items-start gap-3">
						<svg
							class="h-5 w-5 flex-shrink-0 text-red-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							></path>
						</svg>
						<div class="flex-1">
							<h3 class="text-sm font-medium text-red-800">Loading Error</h3>
							<p class="mt-1 text-sm text-red-700">{$errorMessage$}</p>
						</div>
						<button
							aria-label="Clear"
							onclick={() => loadTodosRequest.clearError()}
							class="flex-shrink-0 rounded-md p-1 text-red-400 hover:bg-red-100 hover:text-red-500 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-red-50 focus:outline-none"
						>
							<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M6 18L18 6M6 6l12 12"
								></path>
							</svg>
						</button>
					</div>
				</div>
			</div>
		{/if}

		<main class="space-y-8">
			<!-- Add new todo -->
			<section class="{cardClasses} p-8">
				<h2 class="mb-6 text-2xl font-semibold text-gray-800">Add New Task</h2>

				<!-- Add Todo Error Display -->
				{#if $addError$}
					<div class="mb-4 {errorCardClasses}">
						<div class="flex items-center gap-2">
							<svg class={errorIconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								></path>
							</svg>
							<p class={errorTextClasses}>{$addError$}</p>
							<button onclick={() => addTodoRequest.clearError()} class={errorCloseButtonClasses}>
								<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M6 18L18 6M6 6l12 12"
									></path>
								</svg>
							</button>
						</div>
					</div>
				{/if}

				<div class="flex items-center gap-4">
					<input
						type="text"
						value={$newTodoText$}
						oninput={(e) => todoActions.updateNewTodoText((e.target as HTMLInputElement).value)}
						placeholder="Enter your task..."
						onkeydown={(e) => handleKeydown(e, () => todoActions.addTodo($newTodoText$))}
						class={inputClasses}
					/>
					<button
						onclick={() => todoActions.addTodo($newTodoText$)}
						disabled={!$newTodoText$.trim() || $addLoading$}
						class={primaryButtonClasses}
					>
						{#if $addLoading$}
							<div class="flex items-center gap-2">
								<div class={spinnerClasses}></div>
								Adding...
							</div>
						{:else}
							Add Task
						{/if}
					</button>
				</div>
			</section>

			<!-- Stats Dashboard -->
			<section class="grid grid-cols-1 gap-6 md:grid-cols-3">
				{#each statsCards as card}
					<div class="{cardClasses} p-6">
						<div class="flex items-center justify-between">
							<div>
								<p class="text-sm font-medium tracking-wide text-gray-600 uppercase">
									{card.label}
								</p>
								<p class="text-3xl font-bold text-{card.color}-600">{card.value()}</p>
							</div>
							<div
								class="flex h-12 w-12 items-center justify-center rounded-lg bg-{card.color}-100"
							>
								<svg
									class="h-6 w-6 text-{card.color}-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d={card.icon}
									></path>
								</svg>
							</div>
						</div>
					</div>
				{/each}
			</section>

			<!-- Todo list -->
			<section class={cardClasses}>
				<div class="border-b border-gray-200 p-6">
					<h2 class="text-2xl font-semibold text-gray-800">Your Tasks</h2>
				</div>
				<div class="p-6">
					{#if $loading$ && $todos$.length === 0}
						<!-- Loading skeleton -->
						<div class="space-y-4">
							{#each Array(3) as _, i}
								<div class="animate-pulse rounded-lg bg-gray-100 p-4">
									<div class="flex items-center gap-4">
										<div class="h-5 w-5 rounded bg-gray-300"></div>
										<div class="h-5 flex-1 rounded bg-gray-300"></div>
									</div>
								</div>
							{/each}
						</div>
					{:else if $todos$.length === 0}
						<div class="py-16 text-center">
							<div
								class="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100"
							>
								<svg
									class="h-12 w-12 text-gray-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
									></path>
								</svg>
							</div>
							<h3 class="mb-2 text-xl font-semibold text-gray-800">No tasks yet</h3>
							<p class="text-gray-600">
								Add your first task to get started with your productivity journey.
							</p>
						</div>
					{:else}
						<div class="space-y-3">
							{#each $todos$ as todo (todo.id)}
								<div
									class="group rounded-lg border border-gray-200 bg-gray-50 p-4 transition-all hover:shadow-md"
								>
									<!-- Error displays for todo operations -->
									{#each errorDisplays as errorDisplay}
										{#if errorDisplay.error$()}
											<div class="mb-3 {errorCardClasses} p-2">
												<div class="flex items-center gap-2">
													<svg
														class={errorIconClasses}
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="2"
															d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
														></path>
													</svg>
													<p class={errorTextClasses}>{errorDisplay.error$()}</p>
													<button
														onclick={() => errorDisplay.request.clearError()}
														class={errorCloseButtonClasses}
													>
														<svg
															class="h-4 w-4"
															fill="none"
															stroke="currentColor"
															viewBox="0 0 24 24"
														>
															<path
																stroke-linecap="round"
																stroke-linejoin="round"
																stroke-width="2"
																d="M6 18L18 6M6 6l12 12"
															></path>
														</svg>
													</button>
												</div>
											</div>
										{/if}
									{/each}

									<div class="flex items-center gap-4">
										<div class="flex items-center gap-2">
											<input
												type="checkbox"
												checked={todo.completed}
												onchange={() => todoActions.toggleTodo(todo.id)}
												disabled={$toggleLoading$}
												class="h-5 w-5 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
											/>
											{#if $toggleLoading$}
												<div class="{spinnerClasses} border-blue-600"></div>
											{/if}
										</div>

										{#if $editingId$ === todo.id}
											<input
												type="text"
												value={$editingText$}
												oninput={(e) =>
													todoActions.updateEditingText((e.target as HTMLInputElement).value)}
												onkeydown={(e) =>
													handleKeydown(e, () => todoActions.saveEdit($editingId$, $editingText$))}
												disabled={$updateLoading$}
												class="flex-1 rounded-md border border-blue-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
											/>
										{:else}
											<span
												class="flex-1 text-lg {todo.completed
													? 'text-gray-500 line-through'
													: 'text-gray-800'}"
											>
												{todo.text}
											</span>
										{/if}

										<div class="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
											{#if $editingId$ === todo.id}
												<button
													onclick={() => todoActions.saveEdit($editingId$, $editingText$)}
													disabled={$updateLoading$}
													class={saveButtonClasses}
												>
													{#if $updateLoading$}
														<div class="flex items-center gap-1">
															<div class={smallSpinnerClasses}></div>
															Saving...
														</div>
													{:else}
														Save
													{/if}
												</button>
												<button
													onclick={todoActions.cancelEditing}
													disabled={$updateLoading$}
													class={cancelButtonClasses}
												>
													Cancel
												</button>
											{:else}
												<button
													onclick={() => todoActions.startEditing(todo)}
													disabled={$loading$ ||
														$addLoading$ ||
														$toggleLoading$ ||
														$updateLoading$ ||
														$deleteLoading$}
													class={editButtonClasses}
												>
													Edit
												</button>
												<button
													onclick={() => todoActions.deleteTodo(todo.id)}
													disabled={$deleteLoading$}
													class={deleteButtonClasses}
												>
													{#if $deleteLoading$}
														<div class="flex items-center gap-1">
															<div class={smallSpinnerClasses}></div>
															Deleting...
														</div>
													{:else}
														Delete
													{/if}
												</button>
											{/if}
										</div>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</section>
		</main>
	</div>
</div>
