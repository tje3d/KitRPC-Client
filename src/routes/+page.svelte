<script lang="ts">
	import {
		editingId$,
		editingText$,
		loading$,
		newTodoText$,
		todoActions,
		todos$,
		todoStats$
	} from '$lib/stores/todoStore';
	import { onMount } from 'svelte';

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
			<h1 class="mb-3 text-5xl font-bold text-gray-800 tracking-tight">
				Todo Manager
			</h1>
			<p class="text-xl text-gray-600 font-medium">
				Stay organized and productive with your tasks
			</p>
		</header>

		<main class="space-y-8">
			<!-- Add new todo -->
			<section class="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
				<h2 class="text-2xl font-semibold text-gray-800 mb-6">Add New Task</h2>
				<div class="flex items-center gap-4">
					<input
						type="text"
						value={$newTodoText$}
						on:input={(e) => todoActions.updateNewTodoText((e.target as HTMLInputElement).value)}
						placeholder="Enter your task..."
						on:keydown={(e) => handleKeydown(e, () => todoActions.addTodo($newTodoText$))}
						class="flex-1 px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
					/>
					<button
						on:click={() => todoActions.addTodo($newTodoText$)}
						disabled={!$newTodoText$.trim()}
						class="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
					>
						Add Task
					</button>
					{#if $loading$}
						<div class="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
					{/if}
				</div>
			</section>

			<!-- Stats Dashboard -->
			<section class="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div class="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Tasks</p>
							<p class="text-3xl font-bold text-gray-800">{$todoStats$.total}</p>
						</div>
						<div class="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
							<svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
							</svg>
						</div>
					</div>
				</div>
				<div class="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-sm font-medium text-gray-600 uppercase tracking-wide">Completed</p>
							<p class="text-3xl font-bold text-green-600">{$todoStats$.completed}</p>
						</div>
						<div class="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
							<svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
							</svg>
						</div>
					</div>
				</div>
				<div class="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-sm font-medium text-gray-600 uppercase tracking-wide">Remaining</p>
							<p class="text-3xl font-bold text-orange-600">{$todoStats$.remaining}</p>
						</div>
						<div class="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
							<svg class="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
							</svg>
						</div>
					</div>
				</div>
			</section>

			<!-- Todo list -->
			<section class="bg-white rounded-xl shadow-lg border border-gray-200">
				<div class="p-6 border-b border-gray-200">
					<h2 class="text-2xl font-semibold text-gray-800">Your Tasks</h2>
				</div>
				<div class="p-6">
					{#if $loading$ && $todos$.length === 0}
						<!-- Loading skeleton -->
						<div class="space-y-4">
							{#each Array(3) as _, i}
								<div class="animate-pulse bg-gray-100 rounded-lg p-4">
									<div class="flex items-center gap-4">
										<div class="h-5 w-5 bg-gray-300 rounded"></div>
										<div class="h-5 flex-1 bg-gray-300 rounded"></div>
									</div>
								</div>
							{/each}
						</div>
					{:else if $todos$.length === 0}
						<div class="text-center py-16">
							<div class="h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
								<svg class="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
								</svg>
							</div>
							<h3 class="text-xl font-semibold text-gray-800 mb-2">No tasks yet</h3>
							<p class="text-gray-600">Add your first task to get started with your productivity journey.</p>
						</div>
					{:else}
						<div class="space-y-3">
							{#each $todos$ as todo (todo.id)}
								<div class="group bg-gray-50 rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all">
									<div class="flex items-center gap-4">
										<input
											type="checkbox"
											checked={todo.completed}
											on:change={() => todoActions.toggleTodo(todo.id)}
											class="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
										/>

										{#if $editingId$ === todo.id}
											<input
												type="text"
												value={$editingText$}
												on:input={(e) => todoActions.updateEditingText((e.target as HTMLInputElement).value)}
												on:keydown={(e) => handleKeydown(e, () => todoActions.saveEdit($editingId$, $editingText$))}
												class="flex-1 px-3 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
											/>
										{:else}
											<span class="flex-1 text-lg {todo.completed ? 'text-gray-500 line-through' : 'text-gray-800'}">
												{todo.text}
											</span>
										{/if}

										<div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
											{#if $editingId$ === todo.id}
												<button
													on:click={() => todoActions.saveEdit($editingId$, $editingText$)}
													class="px-3 py-1 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
												>
													Save
												</button>
												<button
													on:click={todoActions.cancelEditing}
													class="px-3 py-1 bg-gray-500 text-white text-sm font-medium rounded-md hover:bg-gray-600 transition-colors"
												>
													Cancel
												</button>
											{:else}
												<button
													on:click={() => todoActions.startEditing(todo)}
													class="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
												>
													Edit
												</button>
												<button
													on:click={() => todoActions.deleteTodo(todo.id)}
													class="px-3 py-1 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
												>
													Delete
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
