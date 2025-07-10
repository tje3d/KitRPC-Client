import type { Context } from '$lib/trpc/context';
import { initTRPC } from '@trpc/server';

export const t = initTRPC.context<Context>().create({
	errorFormatter: ({ shape, error }) => {
		if (shape.data.code === 'INTERNAL_SERVER_ERROR') {
			console.error(`INTERNAL_SERVER_ERROR`, error);
			console.error('Uncaught exception detected, crashing server...');
			process.exit(1);
		}

		return shape;
	}
});
