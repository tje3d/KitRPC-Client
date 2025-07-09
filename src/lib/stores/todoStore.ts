import { page } from '$app/stores';
import { trpc } from '$lib/trpc/client';
import { BehaviorSubject, combineLatest, map, shareReplay } from 'rxjs';
import { get } from 'svelte/store';

// State observables
export const todos$ = new BehaviorSubject<App.Todo[]>([]);
export const loading$ = new BehaviorSubject<boolean>(true);
export const editingId$ = new BehaviorSubject<string | null>(null);
export const editingText$ = new BehaviorSubject<string>('');
export const newTodoText$ = new BehaviorSubject<string>('');

// Derived observables
export const completedTodos$ = todos$.pipe(
	map((todos) => todos.filter((todo) => todo.completed)),
	shareReplay({ bufferSize: 1, refCount: true })
);

export const remainingTodos$ = todos$.pipe(
	map((todos) => todos.filter((todo) => !todo.completed)),
	shareReplay({ bufferSize: 1, refCount: true })
);

export const todoStats$ = combineLatest([todos$, completedTodos$, remainingTodos$]).pipe(
	map(([todos, completed, remaining]) => ({
		total: todos.length,
		completed: completed.length,
		remaining: remaining.length
	})),
	shareReplay({ bufferSize: 1, refCount: true })
);

// Actions
export const todoActions = {
	async loadTodos() {
		loading$.next(true);
		try {
			const pageStore = get(page);
			const todosData = await trpc(pageStore).todos.getAll.query();
			todos$.next(todosData);
		} catch (error) {
			console.error('Failed to load todos:', error);
		} finally {
			loading$.next(false);
		}
	},

	async addTodo(text: string) {
		if (!text.trim()) return;

		try {
			const pageStore = get(page);
			await trpc(pageStore).todos.add.mutate({ text: text.trim() });
			newTodoText$.next('');
			await this.loadTodos();
		} catch (error) {
			console.error('Failed to add todo:', error);
		}
	},

	async toggleTodo(id: string) {
		try {
			const pageStore = get(page);
			await trpc(pageStore).todos.toggle.mutate({ id });
			await this.loadTodos();
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
			const pageStore = get(page);
			await trpc(pageStore).todos.update.mutate({
				id,
				text: text.trim()
			});
			this.cancelEditing();
			await this.loadTodos();
		} catch (error) {
			console.error('Failed to update todo:', error);
		}
	},

	async deleteTodo(id: string) {
		try {
			const pageStore = get(page);
			await trpc(pageStore).todos.delete.mutate({ id });
			await this.loadTodos();
		} catch (error) {
			console.error('Failed to delete todo:', error);
		}
	},

	updateNewTodoText(text: string) {
		newTodoText$.next(text);
	},

	updateEditingText(text: string) {
		editingText$.next(text);
	}
};
