import {
	BehaviorSubject,
	Observable,
	pipe,
	shareReplay,
	Subscriber,
	type MonoTypeOperatorFunction,
	type TeardownLogic
} from 'rxjs';

export class SvelteSubject<T> extends BehaviorSubject<T> {
	set(value: T): void {
		super.next(value);
	}
}

export function shareIt<T>(refCount: boolean = true): MonoTypeOperatorFunction<T> {
	return pipe(shareReplay({ refCount, bufferSize: 1 }));
}

export function debounceWithImmediateAndMaxWait<T>(
	debounceTime: number,
	maxWaitTime: number
): (source: Observable<T>) => Observable<T> {
	return (source: Observable<T>) =>
		new Observable<T>((subscriber: Subscriber<T>): TeardownLogic => {
			let lastValue: T | undefined;
			let debounceTimer: ReturnType<typeof setTimeout> | null = null;
			let maxWaitTimer: ReturnType<typeof setTimeout> | null = null;
			let maxWaitStarted = false;
			let isFirstEmission = true;

			const clearTimers = () => {
				if (debounceTimer !== null) {
					clearTimeout(debounceTimer);
					debounceTimer = null;
				}
				if (maxWaitTimer !== null) {
					clearTimeout(maxWaitTimer);
					maxWaitTimer = null;
				}
			};

			const emitValue = () => {
				if (lastValue !== undefined) {
					subscriber.next(lastValue);
					lastValue = undefined;
				}
				clearTimers();
				maxWaitStarted = false;
			};

			const startDebounce = () => {
				if (debounceTimer !== null) {
					clearTimeout(debounceTimer);
				}
				debounceTimer = setTimeout(() => {
					emitValue();
				}, debounceTime);
			};

			const startMaxWait = () => {
				if (!maxWaitStarted) {
					maxWaitStarted = true;
					maxWaitTimer = setTimeout(() => {
						emitValue();
					}, maxWaitTime);
				}
			};

			const subscription = source.subscribe({
				next(value: T) {
					lastValue = value;

					if (isFirstEmission) {
						// Emit the first value immediately
						subscriber.next(lastValue);
						lastValue = undefined;
						isFirstEmission = false;
					} else {
						startDebounce();
						startMaxWait();
					}
				},
				error(err: any) {
					clearTimers();
					subscriber.error(err);
				},
				complete() {
					// Emit any pending value before completing
					emitValue();
					subscriber.complete();
				}
			});

			return () => {
				clearTimers();
				subscription.unsubscribe();
			};
		});
}
