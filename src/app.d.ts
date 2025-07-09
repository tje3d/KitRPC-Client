// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { Todo as PrismaTodo } from '@prisma/client';

declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
		
		// Shared types - using Prisma-generated type with Date converted to string
		type Todo = Omit<PrismaTodo, 'createdAt'> & {
			createdAt: string;
		};
	}
}

export {};
