import { useBooleanStorage, useObjectStorage } from '$lib/helpers/localStorage.helper';
import { shareIt, SvelteSubject } from '$lib/helpers/rxjs.helper';
import { distinctUntilChanged, Observable } from 'rxjs';

export const [isLoggedInMain, setIsLoggedIn] = useBooleanStorage('isloggedin', false);
export const isLoggedIn = isLoggedInMain.pipe(distinctUntilChanged(), shareIt());

export const [authUser, setAuthUser] = useObjectStorage<App.AuthUser>('authUser');
export const [manualLogout, setManualLogout] = useBooleanStorage('manual_logout', false);

export const ready = new SvelteSubject<boolean>(false);

// Getters

// Initialization
export const initAuthFlow = new Observable<boolean>((observer) => {
	const subs: Array<{ unsubscribe: () => void }> = [];

	// subs.push(
	//   networkErrors$.subscribe((r) => {
	//     if (r instanceof AjaxError) {
	//       if (r.status === 401 && !r.request.url.endsWith('user/login')) {
	//         logoutLocal()
	//       }
	//     }
	//   }),
	// )

	// Set ready state
	ready.next(true);
	!observer.closed && observer.next(true);

	return () => {
		subs.forEach((sub) => sub.unsubscribe());
	};
});

// Methods
export const logoutLocal = () => {
	setAuthUser(undefined);
	setIsLoggedIn(false);

	const keysToKeep = ['uniqId', 'manual_logout'];
	const savedValues: Record<string, string | null> = {};

	keysToKeep.forEach((key) => {
		savedValues[key] = localStorage.getItem(key);
	});

	localStorage.clear();

	Object.entries(savedValues).forEach(([key, value]) => {
		if (value !== null) {
			localStorage.setItem(key, value);
		}
	});
};
