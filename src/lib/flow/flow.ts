import { Observable, Subject, Subscription } from 'rxjs';

/**
 * Abstract base class to manage subscriptions for Flows.
 */
export abstract class Flow {
	// Array to hold all active subscriptions.
	private subscriptions: Subscription[] = [];

	/**
	 * Subscribes to the given observable and stores the subscription.
	 *
	 * @param obs The observable to subscribe to.
	 * @param callback The callback to execute on receiving a new value.
	 */
	protected sub<T>(obs: Observable<T>, callback?: (input: T) => void) {
		const sub = obs.subscribe(callback);
		this.subscriptions.push(sub);
	}

	/**
	 * Observable to initialize and manage base class resources.
	 * It emits `true` on subscription and handles cleanup on unsubscription.
	 */
	protected _initBase = new Observable<boolean>((observer) => {
		!observer.closed && observer.next(true);

		return () => {
			this.subscriptions.forEach((sub) => sub.unsubscribe());
			this.subscriptions = [];
		};
	});

	/**
	 * Initializes a value from localStorage with optional validation and deserialization.
	 */
	protected initFromStorage<T>(
		key: string,
		subject: Subject<T>,
		options?: {
			validator?: (value: string) => boolean;
			deserializer?: (value: string) => T;
		}
	) {
		const cachedValue = localStorage.getItem(key);
		if (typeof cachedValue === 'string') {
			if (!options?.validator || options.validator(cachedValue)) {
				const deserializedValue = options?.deserializer
					? options.deserializer(cachedValue)
					: (cachedValue as T);
				subject.next(deserializedValue);
			} else {
				localStorage.removeItem(key);
			}
		}
	}

	/**
	 * Initializes a boolean value from localStorage with default validator and deserializer.
	 */
	protected initBooleanFromStorage(key: string, subject: Subject<boolean>) {
		this.initFromStorage(key, subject, {
			validator: (value) => ['true', 'false'].includes(value),
			deserializer: (value) => value === 'true'
		});
	}

	/**
	 * Sets up storage synchronization with optional serialization.
	 */
	protected syncWithStorage<T>(
		key: string,
		observable: Observable<T>,
		serializer?: (value: T) => string
	) {
		this.sub(observable, (value: T) => {
			const serializedValue = serializer ? serializer(value) : (value as string);
			localStorage.setItem(key, serializedValue);
		});
	}
}
