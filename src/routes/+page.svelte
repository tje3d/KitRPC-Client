<script lang="ts">
	import { page } from '$app/state';
	import { shareIt } from '$lib/helpers/rxjs.helper';
	import { createTrpcRequestFn, useTrpcRequest } from '$lib/helpers/useTrpcRequest.helper';
	import { trpc } from '$lib/trpc/client';
	import { BehaviorSubject, combineLatest, map, startWith } from 'rxjs';
	import { onMount } from 'svelte';
	import { fade, fly, scale } from 'svelte/transition';
	import { quintOut, elasticOut } from 'svelte/easing';

	// Modern styling classes
	const cardClasses = 'backdrop-blur-xl bg-white/80 border border-white/20 rounded-3xl shadow-2xl';
	const errorCardClasses = 'backdrop-blur-sm bg-red-50/80 border border-red-200 rounded-2xl p-4';
	const primaryButtonClasses =
		'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';
	const inputClasses =
		'flex-1 px-6 py-4 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-lg';
	const actionButtonClasses =
		'px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50';
	const editButtonClasses = `${actionButtonClasses} bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md`;
	const saveButtonClasses = `${actionButtonClasses} bg-green-600 text-white hover:bg-green-700 hover:shadow-md`;
	const cancelButtonClasses = `${actionButtonClasses} bg-gray-500 text-white hover:bg-gray-600 hover:shadow-md`;
	const deleteButtonClasses = `${actionButtonClasses} bg-red-600 text-white hover:bg-red-700 hover:shadow-md`;

	// Stats card data structure with enhanced styling
	const statsCards = [
		{
			label: 'Total Tasks',
			value: () => $todoStats$.total,
			color: 'blue',
			bgGradient: 'from-blue-500 to-blue-600',
			iconBg: 'bg-blue-100',
			icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
		},
		{
			label: 'Completed',
			value: () => $todoStats$.completed,
			color: 'green',
			bgGradient: 'from-green-500 to-emerald-600',
			iconBg: 'bg-green-100',
			icon: 'M5 13l4 4L19 7'
		},
		{
			label: 'Remaining',
			value: () => $todoStats$.remaining,
			color: 'orange',
			bgGradient: 'from-orange-500 to-amber-600',
			iconBg: 'bg-orange-100',
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
	<title>Todo Manager - Stay Organized & Productive</title>
	<meta
		name="description"
		content="Professional todo manager to help you stay organized and productive with your daily tasks"
	/>
</svelte:head>

<div
	class="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
>
	<!-- Background decoration -->
	<div class="pointer-events-none absolute inset-0 overflow-hidden">
		<div
			class="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-600/20 blur-3xl"
		></div>
		<div
			class="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-tr from-indigo-400/20 to-pink-600/20 blur-3xl"
		></div>
		<div
			class="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-gradient-to-r from-cyan-400/10 to-blue-600/10 blur-3xl"
		></div>
	</div>

	<div class="relative z-10 mx-auto max-w-6xl px-6 py-8">
		<!-- Header -->
		<header class="mb-12 text-center" in:fly={{ y: -20, duration: 800, easing: quintOut }}>
			<div
				class="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-2xl"
			>
				<svg class="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
					/>
				</svg>
			</div>
			<h1
				class="mb-4 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-6xl font-bold tracking-tight text-transparent"
			>
				Todo Manager
			</h1>
			<p class="mx-auto max-w-2xl text-xl font-medium text-gray-600">
				Stay organized and productive with your tasks. Manage your daily workflow with style and
				efficiency.
			</p>
		</header>

		<!-- Global Error Toast -->
		{#if $errorMessage$}
			<div
				class="fixed top-6 right-6 z-50 max-w-md"
				in:fly={{ x: 300, duration: 400, easing: quintOut }}
				out:fly={{ x: 300, duration: 300 }}
			>
				<div class="rounded-2xl border border-red-200 bg-red-50/90 p-4 shadow-2xl backdrop-blur-xl">
					<div class="flex items-start gap-3">
						<div
							class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-100"
						>
							<svg
								class="h-4 w-4 text-red-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<div class="flex-1">
							<h3 class="text-sm font-semibold text-red-800">Loading Error</h3>
							<p class="mt-1 text-sm text-red-700">{$errorMessage$}</p>
						</div>
						<button
							on:click={() => loadTodosRequest.clearError()}
							class="flex-shrink-0 rounded-lg p-1 text-red-400 transition-colors hover:bg-red-100 hover:text-red-600"
							aria-label="Dismiss error"
						>
							<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>
				</div>
			</div>
		{/if}

		<main class="space-y-8">
			<!-- Add new todo section -->
			<section
				class="{cardClasses} p-8"
				in:fly={{ y: 20, duration: 600, delay: 200, easing: quintOut }}
			>
				<div class="mb-6 flex items-center gap-4">
					<div
						class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg"
					>
						<svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 6v6m0 0v6m0-6h6m-6 0H6"
							/>
						</svg>
					</div>
					<h2 class="text-2xl font-bold text-gray-800">Add New Task</h2>
				</div>

				<!-- Add Todo Error Display -->
				{#if $addError$}
					<div class="mb-6 {errorCardClasses}" in:fade={{ duration: 300 }}>
						<div class="flex items-center gap-3">
							<svg
								class="h-5 w-5 flex-shrink-0 text-red-500"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<p class="flex-1 text-sm text-red-700">{$addError$}</p>
							<button
								on:click={() => addTodoRequest.clearError()}
								class="text-red-400 transition-colors hover:text-red-600"
								aria-label="Dismiss error"
							>
								<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>
					</div>
				{/if}

				<div class="flex items-center gap-4">
					<div class="relative flex-1">
						<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
							<svg
								class="h-5 w-5 text-gray-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
								/>
							</svg>
						</div>
						<input
							type="text"
							value={$newTodoText$}
							on:input={(e) => todoActions.updateNewTodoText((e.target as HTMLInputElement).value)}
							placeholder="What needs to be done today?"
							on:keydown={(e) => handleKeydown(e, () => todoActions.addTodo($newTodoText$))}
							class="w-full rounded-2xl border border-gray-200 bg-white/50 py-4 pr-4 pl-12 text-lg placeholder-gray-400 backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500"
						/>
					</div>
					<button
						on:click={() => todoActions.addTodo($newTodoText$)}
						disabled={!$newTodoText$.trim() || $addLoading$}
						class={primaryButtonClasses}
					>
						{#if $addLoading$}
							<div class="flex items-center gap-2">
								<svg class="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
									<circle
										class="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										stroke-width="4"
									></circle>
									<path
										class="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									></path>
								</svg>
								Adding...
							</div>
						{:else}
							<div class="flex items-center gap-2">
								<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 6v6m0 0v6m0-6h6m-6 0H6"
									/>
								</svg>
								Add Task
							</div>
						{/if}
					</button>
				</div>
			</section>

			<!-- Stats Dashboard -->
			<section
				class="grid grid-cols-1 gap-6 md:grid-cols-3"
				in:fly={{ y: 20, duration: 600, delay: 400, easing: quintOut }}
			>
				{#each statsCards as card, index}
					<div
						class="{cardClasses} p-6 transition-transform duration-200 hover:scale-105"
						in:scale={{ duration: 500, delay: 600 + index * 100, easing: elasticOut }}
					>
						<div class="flex items-center justify-between">
							<div>
								<p class="mb-2 text-sm font-semibold tracking-wide text-gray-500 uppercase">
									{card.label}
								</p>
								<p
									class="bg-gradient-to-r text-4xl font-bold {card.bgGradient} bg-clip-text text-transparent"
								>
									{card.value()}
								</p>
							</div>
							<div
								class="h-16 w-16 {card.iconBg} flex items-center justify-center rounded-2xl shadow-lg"
							>
								<svg
									class="h-8 w-8 text-{card.color}-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d={card.icon}
									/>
								</svg>
							</div>
						</div>
					</div>
				{/each}
			</section>

			<!-- Todo list -->
			<section class={cardClasses} in:fly={{ y: 20, duration: 600, delay: 600, easing: quintOut }}>
				<div class="border-b border-gray-200/50 p-8">
					<div class="flex items-center gap-4">
						<div
							class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg"
						>
							<svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
								/>
							</svg>
						</div>
						<h2 class="text-2xl font-bold text-gray-800">Your Tasks</h2>
						{#if $todos$.length > 0}
							<div
								class="ml-auto rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
							>
								{$todos$.length}
								{$todos$.length === 1 ? 'task' : 'tasks'}
							</div>
						{/if}
					</div>
				</div>

				<div class="p-8">
					{#if $loading$ && $todos$.length === 0}
						<!-- Enhanced loading skeleton -->
						<div class="space-y-4">
							{#each Array(3) as _, i}
								<div
									class="animate-pulse rounded-2xl bg-gradient-to-r from-gray-100 to-gray-200 p-6"
									in:fade={{ delay: i * 100 }}
								>
									<div class="flex items-center gap-4">
										<div class="h-6 w-6 rounded-full bg-gray-300"></div>
										<div class="h-6 flex-1 rounded-lg bg-gray-300"></div>
										<div class="flex gap-2">
											<div class="h-8 w-16 rounded-lg bg-gray-300"></div>
											<div class="h-8 w-16 rounded-lg bg-gray-300"></div>
										</div>
									</div>
								</div>
							{/each}
						</div>
					{:else if $todos$.length === 0}
						<div class="py-20 text-center" in:fade={{ duration: 500 }}>
							<div
								class="mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 shadow-lg"
							>
								<svg
									class="h-16 w-16 text-blue-500"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
									/>
								</svg>
							</div>
							<h3 class="mb-3 text-2xl font-bold text-gray-800">No tasks yet</h3>
							<p class="mx-auto max-w-md text-lg leading-relaxed text-gray-600">
								Ready to boost your productivity? Add your first task above and start organizing
								your day.
							</p>
						</div>
					{:else}
						<div class="space-y-4">
							{#each $todos$ as todo, index (todo.id)}
								<div
									class="group rounded-2xl border border-white/30 bg-white/60 p-6 backdrop-blur-sm transition-all duration-200 hover:bg-white/80 hover:shadow-xl"
									in:fly={{ y: 20, duration: 400, delay: index * 50 }}
								>
									<!-- Error displays for todo operations -->
									{#each errorDisplays as errorDisplay}
										{#if errorDisplay.error$()}
											<div class="mb-4 {errorCardClasses}" in:fade={{ duration: 300 }}>
												<div class="flex items-center gap-3">
													<svg
														class="h-4 w-4 flex-shrink-0 text-red-500"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="2"
															d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
														/>
													</svg>
													<p class="flex-1 text-sm text-red-700">{errorDisplay.error$()}</p>
													<button
														on:click={() => errorDisplay.request.clearError()}
														class="text-red-400 transition-colors hover:text-red-600"
														aria-label="Dismiss error"
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
															/>
														</svg>
													</button>
												</div>
											</div>
										{/if}
									{/each}

									<div class="flex items-center gap-4">
										<div class="flex items-center gap-3">
											<div class="relative">
												<input
													type="checkbox"
													checked={todo.completed}
													on:change={() => todoActions.toggleTodo(todo.id)}
													disabled={$toggleLoading$}
													class="h-6 w-6 rounded-lg border-2 border-gray-300 text-blue-600 transition-all duration-200 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
												/>
												{#if $toggleLoading$}
													<div class="absolute inset-0 flex items-center justify-center">
														<svg
															class="h-4 w-4 animate-spin text-blue-600"
															fill="none"
															viewBox="0 0 24 24"
														>
															<circle
																class="opacity-25"
																cx="12"
																cy="12"
																r="10"
																stroke="currentColor"
																stroke-width="4"
															></circle>
															<path
																class="opacity-75"
																fill="currentColor"
																d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
															></path>
														</svg>
													</div>
												{/if}
											</div>
										</div>

										{#if $editingId$ === todo.id}
											<input
												type="text"
												value={$editingText$}
												on:input={(e) =>
													todoActions.updateEditingText((e.target as HTMLInputElement).value)}
												on:keydown={(e) =>
													handleKeydown(e, () => todoActions.saveEdit($editingId$, $editingText$))}
												disabled={$updateLoading$}
												class="flex-1 rounded-xl border border-blue-300 bg-white/70 px-4 py-3 backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
												autofocus
											/>
										{:else}
											<span
												class="flex-1 text-lg font-medium transition-all duration-200 {todo.completed
													? 'text-gray-500 line-through'
													: 'text-gray-800'}"
											>
												{todo.text}
											</span>
										{/if}

										<div
											class="flex gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
										>
											{#if $editingId$ === todo.id}
												<button
													on:click={() => todoActions.saveEdit($editingId$, $editingText$)}
													disabled={$updateLoading$}
													class={saveButtonClasses}
												>
													{#if $updateLoading$}
														<div class="flex items-center gap-2">
															<svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
																<circle
																	class="opacity-25"
																	cx="12"
																	cy="12"
																	r="10"
																	stroke="currentColor"
																	stroke-width="4"
																></circle>
																<path
																	class="opacity-75"
																	fill="currentColor"
																	d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
																></path>
															</svg>
															Saving...
														</div>
													{:else}
														<svg
															class="mr-1 h-4 w-4"
															fill="none"
															stroke="currentColor"
															viewBox="0 0 24 24"
														>
															<path
																stroke-linecap="round"
																stroke-linejoin="round"
																stroke-width="2"
																d="M5 13l4 4L19 7"
															/>
														</svg>
														Save
													{/if}
												</button>
												<button
													on:click={todoActions.cancelEditing}
													disabled={$updateLoading$}
													class={cancelButtonClasses}
												>
													<svg
														class="mr-1 h-4 w-4"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="2"
															d="M6 18L18 6M6 6l12 12"
														/>
													</svg>
													Cancel
												</button>
											{:else}
												<button
													on:click={() => todoActions.startEditing(todo)}
													disabled={$loading$ ||
														$addLoading$ ||
														$toggleLoading$ ||
														$updateLoading$ ||
														$deleteLoading$}
													class={editButtonClasses}
												>
													<svg
														class="mr-1 h-4 w-4"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="2"
															d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
														/>
													</svg>
													Edit
												</button>
												<button
													on:click={() => todoActions.deleteTodo(todo.id)}
													disabled={$deleteLoading$}
													class={deleteButtonClasses}
												>
													{#if $deleteLoading$}
														<div class="flex items-center gap-2">
															<svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
																<circle
																	class="opacity-25"
																	cx="12"
																	cy="12"
																	r="10"
																	stroke="currentColor"
																	stroke-width="4"
																></circle>
																<path
																	class="opacity-75"
																	fill="currentColor"
																	d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
																></path>
															</svg>
															Deleting...
														</div>
													{:else}
														<svg
															class="mr-1 h-4 w-4"
															fill="none"
															stroke="currentColor"
															viewBox="0 0 24 24"
														>
															<path
																stroke-linecap="round"
																stroke-linejoin="round"
																stroke-width="2"
																d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
															/>
														</svg>
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
