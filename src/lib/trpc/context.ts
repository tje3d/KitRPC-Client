import type { RequestEvent } from '@sveltejs/kit';
import { validateSession } from '$lib/auth';

export async function createContext(event: RequestEvent) {
	// Extract token from cookies
	const token = event.cookies.get('session_token');
	
	// Validate session if token exists
	let user = null;
	if (token) {
		const session = await validateSession(token);
		if (session) {
			user = session.user;
		}
	}

	return {
		user,
		request: event.request,
		cookies: event.cookies
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
