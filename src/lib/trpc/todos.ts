import { prisma } from '$lib/prisma';
import { TRPCError } from '@trpc/server';
import { t } from './trpc';

export const todosRouter = t.router({
	// Get all todos
	getAll: t.procedure.query(async () => {
		try {
			const todos = await prisma.todo.findMany({
				orderBy: {
					createdAt: 'desc'
				}
			});
			return todos.map((todo) => ({
				...todo,
				createdAt: todo.createdAt.toISOString()
			}));
		} catch (error) {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to fetch todos'
			});
		}
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
			try {
				const newTodo = await prisma.todo.create({
					data: {
						text: input.text,
						completed: false
					}
				});
				return {
					...newTodo,
					createdAt: newTodo.createdAt.toISOString()
				};
			} catch (error) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to create todo'
				});
			}
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
			try {
				// First, get the current todo
				const existingTodo = await prisma.todo.findUnique({
					where: { id: input.id }
				});

				if (!existingTodo) {
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: 'Todo not found'
					});
				}

				// Update the todo
				const updatedTodo = await prisma.todo.update({
					where: { id: input.id },
					data: {
						completed: !existingTodo.completed
					}
				});

				return {
					...updatedTodo,
					createdAt: updatedTodo.createdAt.toISOString()
				};
			} catch (error) {
				if (error instanceof TRPCError) {
					throw error;
				}
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to toggle todo'
				});
			}
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
			try {
				const updatedTodo = await prisma.todo.update({
					where: { id: input.id },
					data: {
						text: input.text
					}
				});

				return {
					...updatedTodo,
					createdAt: updatedTodo.createdAt.toISOString()
				};
			} catch (error: any) {
				if (error.code === 'P2025') {
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: 'Todo not found'
					});
				}
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to update todo'
				});
			}
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
			try {
				const deletedTodo = await prisma.todo.delete({
					where: { id: input.id }
				});

				return {
					...deletedTodo,
					createdAt: deletedTodo.createdAt.toISOString()
				};
			} catch (error: any) {
				if (error.code === 'P2025') {
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: 'Todo not found'
					});
				}
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to delete todo'
				});
			}
		})
});
