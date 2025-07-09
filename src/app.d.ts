// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
		
		// Shared types
		interface Todo {
			id: string;
			text: string;
			completed: boolean;
			createdAt: string;
		}
	}
}

export {};
