// See https://svelte.dev/docs/kit/types#app.d.ts

declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}

		// Toast
		type ToastVariant = 'info' | 'success' | 'warning' | 'error';

		interface ToastData {
			id: symbol;
			message: string;
			variant: ToastVariant;
			duration: number;
			pauseOnHover: boolean;
			createdAt: number;
			remaining: number;
			_timer?: ReturnType<typeof setTimeout>;
		}

		// Dialog
		interface DialogConfig {
			id: string;
			component: any;
			props?: Record<string, any>;
			onClose?: () => void;
			preventBackdropClose?: boolean;
			preventDirtyClose?: boolean;
			showClose?: boolean;
			noPadding?: boolean;
			center?: boolean;
			fullScreen?: boolean;
			transitionType?: 'scale' | 'fly';
		}

		interface DialogState {
			dialogs: DialogConfig[];
		}

		interface AuthUser {}
	}
}

export {};
