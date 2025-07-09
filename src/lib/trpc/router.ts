import { todosRouter } from './todos';
import { t } from './trpc';

export const router = t.router({
	greeting: t.procedure.query(async () => {
		return `Hello tRPC v11 @ ${new Date().toLocaleTimeString()}`;
	}),

	// Todo procedures
	todos: todosRouter
});

export type Router = typeof router;
