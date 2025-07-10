import { hasPermission } from '$lib/auth';
import { TRPCError } from '@trpc/server';
import { t } from './trpc';

// Middleware for authenticated users
export const isAuthenticated = t.middleware(async ({ ctx, next }) => {
	if (!ctx.user) {
		throw new TRPCError({
			code: 'UNAUTHORIZED',
			message: 'You must be logged in to access this resource'
		});
	}
	return next({
		ctx: {
			...ctx,
			user: ctx.user
		}
	});
});

// Generic permission middleware factory
export const createPermissionMiddleware = (resource: string, action: string) =>
	t.middleware(async ({ ctx, next }) => {
		if (!ctx.user) {
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: 'You must be logged in'
			});
		}

		if (!hasPermission(ctx.user, resource, action)) {
			throw new TRPCError({
				code: 'FORBIDDEN',
				message: `You don't have permission to ${action} ${resource}s`
			});
		}

		return next({
			ctx: {
				...ctx,
				user: ctx.user // Propagate non-null user
			} as {
				user: NonNullable<typeof ctx.user>; // Ensures user exists
			} & typeof ctx // Type assertion ensures user exists
		});
	});
