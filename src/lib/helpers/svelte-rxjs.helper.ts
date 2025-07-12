import { SvelteSubject } from '$lib/helpers/rxjs.helper';
import { Observable, Subject, defer, type Observer, type Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { onDestroy, onMount } from 'svelte';

export const onMount$ = defer(() => {
	const subject = new Subject<void>();
	onMount(() => {
		subject.next();
	});
	return subject.pipe(take(1));
});

export const onDestroy$ = defer(() => {
	const subject = new Subject<void>();
	onDestroy(() => {
		subject.next();
	});
	return subject.pipe(take(1));
});

// Enhanced subscription function with better type support and callback handling
export function subscribe<T>(observable: Observable<T>): Subscription;
export function subscribe<T>(observable: Observable<T>, callback: (value: T) => void): Subscription;
export function subscribe<T>(
	observable: Observable<T>,
	observer: Partial<Observer<T>>
): Subscription;
export function subscribe<T>(
	observable: Observable<T>,
	callbackOrObserver?: ((value: T) => void) | Partial<Observer<T>>
): Subscription {
	const subscription = observable.subscribe(callbackOrObserver as any);

	onDestroy(() => {
		subscription.unsubscribe();
	});

	return subscription;
}

// Original unDestroy function for backward compatibility
export function unDestroy<T>(
	observable: Observable<T>,
	callback?: Partial<Observer<T>> | ((value: T) => void)
): Subscription {
	const sub = observable.subscribe(callback);

	onDestroy(() => {
		sub.unsubscribe();
	});

	return sub;
}

// Enhanced version with better type inference and error handling
export function autoSubscribe<T>(
	observable: Observable<T>,
	options: {
		next?: (value: T) => void;
		error?: (error: any) => void;
		complete?: () => void;
	}
): Subscription;
export function autoSubscribe<T>(
	observable: Observable<T>,
	next: (value: T) => void,
	error?: (error: any) => void,
	complete?: () => void
): Subscription;
export function autoSubscribe<T>(
	observable: Observable<T>,
	nextOrOptions:
		| ((value: T) => void)
		| {
				next?: (value: T) => void;
				error?: (error: any) => void;
				complete?: () => void;
		  },
	error?: (error: any) => void,
	complete?: () => void
): Subscription {
	let observer: Partial<Observer<T>>;

	if (typeof nextOrOptions === 'function') {
		observer = {
			next: nextOrOptions,
			error,
			complete
		};
	} else {
		observer = nextOrOptions;
	}

	const subscription = observable.subscribe(observer);

	onDestroy(() => {
		subscription.unsubscribe();
	});

	return subscription;
}

// Utility to subscribe to multiple observables at once
export function subscribeMultiple<T extends Record<string, Observable<any>>>(
	observables: T,
	callbacks: {
		[K in keyof T]: T[K] extends Observable<infer U> ? (value: U) => void : never;
	}
): Subscription[] {
	const subscriptions: Subscription[] = [];

	for (const [key, observable] of Object.entries(observables)) {
		const callback = callbacks[key as keyof T];
		if (callback) {
			const subscription = observable.subscribe(callback);
			subscriptions.push(subscription);
		}
	}

	onDestroy(() => {
		subscriptions.forEach((sub) => sub.unsubscribe());
	});

	return subscriptions;
}

// Utility to create reactive state from props
export function propsToSubject<
	T extends { [key: string]: any },
	R extends { [K in keyof T]: SvelteSubject<T[K]> }
>(input: T): R {
	const keys = Object.keys(input);
	const output: any = {};

	for (const index in keys) {
		const value = input[keys[index]];
		if (value instanceof SvelteSubject) {
			output[keys[index]] = value;
		} else {
			output[keys[index]] = new SvelteSubject<any>(value);
		}
	}

	return output;
}

// Utility for conditional class names
export function c(defClasses: string, ...propsClass: (string | undefined)[]): string {
	if (!propsClass || propsClass.length === 0) {
		return defClasses;
	}

	return [defClasses].concat(propsClass.filter((i) => typeof i !== 'undefined')).join(' ');
}

// Utility to create a derived observable that automatically unsubscribes
export function derived<T, R>(
	observable: Observable<T>,
	transform: (value: T) => R
): SvelteSubject<R | undefined> {
	const subject = new SvelteSubject<R | undefined>(undefined);

	subscribe(observable, (value) => {
		subject.next(transform(value));
	});

	return subject;
}

// Utility to combine multiple observables into a single subject
export function combine<T extends readonly Observable<any>[]>(
	...observables: T
): SvelteSubject<{ [K in keyof T]: T[K] extends Observable<infer U> ? U : never } | undefined> {
	type CombinedType = { [K in keyof T]: T[K] extends Observable<infer U> ? U : never };
	const subject = new SvelteSubject<CombinedType | undefined>(undefined);
	const values: any[] = new Array(observables.length);
	let hasAllValues = false;

	observables.forEach((observable, index) => {
		subscribe(observable, (value) => {
			values[index] = value;
			if (!hasAllValues && values.every((v) => v !== undefined)) {
				hasAllValues = true;
			}
			if (hasAllValues) {
				subject.next(values as CombinedType);
			}
		});
	});

	return subject;
}
