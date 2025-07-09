import type { Context } from '$lib/trpc/context';
import { initTRPC, TRPCError } from '@trpc/server';

export const t = initTRPC.context<Context>().create();

// In-memory storage for todos
let todos: App.Todo[] = [
	{
		id: '1',
		text: 'Learn SvelteKit',
		completed: false,
		createdAt: new Date().toISOString()
	},
	{
		id: '2',
		text: 'Build a todo app',
		completed: true,
		createdAt: new Date().toISOString()
	},
	{
		id: '3',
		text: 'Deploy to production',
		completed: false,
		createdAt: new Date().toISOString()
	}
];

export const router = t.router({
	greeting: t.procedure.query(async () => {
		return `Hello tRPC v11 @ ${new Date().toLocaleTimeString()}`;
	}),

	// Todo procedures
	todos: t.router({
		// Get all todos
		getAll: t.procedure.query(async () => {
			return todos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
		}),

		// Add a new todo
		add: t.procedure
			.input((input: any) => {
				if (!input || typeof input.text !== 'string' || input.text.trim().length === 0) {
					throw new TRPCError({
						code: 'BAD_REQUEST',
						message: 'Todo text is required'
					});
				}
				return { text: input.text };
			})
			.mutation(async ({ input }) => {
				const newTodo: App.Todo = {
					id: Date.now().toString(),
					text: input.text,
					completed: false,
					createdAt: new Date().toISOString()
				};
				todos.push(newTodo);
				return newTodo;
			}),

		// Toggle todo completion
		toggle: t.procedure
			.input((input: any) => {
				if (!input || typeof input.id !== 'string') {
					throw new TRPCError({
						code: 'BAD_REQUEST',
						message: 'Todo ID is required'
					});
				}
				return { id: input.id };
			})
			.mutation(async ({ input }) => {
				const todo = todos.find((t) => t.id === input.id);
				if (!todo) {
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: 'Todo not found'
					});
				}
				todo.completed = !todo.completed;
				return todo;
			}),

		// Update todo text
		update: t.procedure
			.input((input: any) => {
				if (
					!input ||
					typeof input.id !== 'string' ||
					typeof input.text !== 'string' ||
					input.text.trim().length === 0
				) {
					throw new TRPCError({
						code: 'BAD_REQUEST',
						message: 'Todo ID and text are required'
					});
				}
				return { id: input.id, text: input.text };
			})
			.mutation(async ({ input }) => {
				const todo = todos.find((t) => t.id === input.id);
				if (!todo) {
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: 'Todo not found'
					});
				}
				todo.text = input.text;
				return todo;
			}),

		// Delete a todo
		delete: t.procedure
			.input((input: any) => {
				if (!input || typeof input.id !== 'string') {
					throw new TRPCError({
						code: 'BAD_REQUEST',
						message: 'Todo ID is required'
					});
				}
				return { id: input.id };
			})
			.mutation(async ({ input }) => {
				const index = todos.findIndex((t) => t.id === input.id);
				if (index === -1) {
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: 'Todo not found'
					});
				}
				const deletedTodo = todos.splice(index, 1)[0];
				return deletedTodo;
			})
	})
});

export type Router = typeof router;
