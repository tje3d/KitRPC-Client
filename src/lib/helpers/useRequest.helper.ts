import { getTokenValue } from '$lib/flow/auth.flow';
import { SvelteSubject, shareIt } from '$lib/helpers/rxjs.helper';
import { loadFromLocalStorage, saveToLocalStorage } from '$lib/helpers/localStorage.helper';
import {
	EMPTY,
	Observable,
	Subject,
	catchError,
	distinctUntilChanged,
	filter,
	finalize,
	from,
	map,
	merge,
	of,
	pipe,
	retry,
	startWith,
	switchMap,
	tap,
	throwError,
	timer
} from 'rxjs';
import { AjaxError, AjaxResponse, ajax } from 'rxjs/ajax';

// ─── Types and Interfaces ─────────────────────────────────────────────────────

export type RequestFunction<TParams, TResponse> = (params: TParams) => Observable<TResponse>;

const SUCCESS_STATUS_CODES = [200, 201, 202, 203, 204, 205, 206, 207, 208, 226] as const;

export type SuccessStatusCode = (typeof SUCCESS_STATUS_CODES)[number];

export interface RequestWrapOptions<TResponse extends AjaxResponse<any> = AjaxResponse<any>> {
	interval?: number;
	retryDelay?: number;
	cacheResponse?: boolean;
	startWithCache?: boolean;
	localStorageKey?: string;
	requestOnSubscribe?: boolean;
	retryCount?: number;
	retryMaxDelay?: number;
	global?: boolean;
	validateResponse?: (r: TResponse) => boolean;
	successStatusCodes?: number[];
	shouldTrigger?: Observable<boolean>;
	initialData?: any;
	extractErrorMessage?: (r: TResponse) => string | undefined;
}

interface ApiOptions {
	includeProgress?: boolean;
	method?: string;
	timeout?: number;
}

// ─── Global Subjects ──────────────────────────────────────────────────────────

export const networkErrors$ = new Subject<any>();
export const apiResponses$ = new Subject<any>();

// ─── Error Handling Utilities ────────────────────────────────────────────────

function isRetriableError(error: any): boolean {
	return error?.status === 0 || (error?.status >= 500 && error?.status < 600);
}

function incrementalRetry<T>(count: number, delay: number, maxDelay: number) {
	return retry<T>({
		count,
		delay: (_, attempt) =>
			timer(Math.min(delay * Math.pow(2, attempt - 1), maxDelay)).pipe(map(() => attempt + 1))
	});
}

function retryOnRetriable<T>(count: number, delay: number, maxDelay: number) {
	return pipe(
		catchError((e) => {
			networkErrors$.next(e);
			return isRetriableError(e) ? throwError(() => e) : of(e);
		}),
		incrementalRetry<T>(count, delay, maxDelay)
	);
}

// ─── Base Configuration ──────────────────────────────────────────────────────

function getBaseConfig(input: string | Request) {
	const inputStr = typeof input === 'string' ? input : input.url;
	const url =
		inputStr.startsWith('http://') || inputStr.startsWith('https://')
			? inputStr
			: `${import.meta.env.VITE_API_URL}${inputStr}`;

	const headers: Record<string, string> = {};
	const tokenValue = getTokenValue();

	if (tokenValue) {
		headers['X-Token'] = tokenValue;
	}

	return { url, headers };
}

// ─── API Service Class ───────────────────────────────────────────────────────

export class ApiService {
	/**
	 * Makes a GET request to the specified endpoint
	 */
	static get<T>(input: string | Request, queryParams?: Record<string, any>) {
		const { url, headers } = getBaseConfig(input);
		return ajax<T>({
			url,
			queryParams,
			method: 'GET',
			timeout: 20_000,
			headers,
			responseType: 'json',
			withCredentials: true,
			includeDownloadProgress: false,
			crossDomain: true
		}).pipe(shareIt());
	}

	/**
	 * Makes a POST request to the specified endpoint
	 */
	static post<T>(input: string | Request, body?: any, options: ApiOptions = {}) {
		const { url, headers } = getBaseConfig(input);

		if (!(body instanceof FormData)) {
			headers['Content-Type'] = 'application/json';
		}

		return ajax<T>({
			url,
			body,
			headers,
			method: options.method || 'POST',
			timeout: options.timeout || 30_000,
			responseType: 'json',
			withCredentials: true,
			crossDomain: true,
			includeUploadProgress: options.includeProgress,
			includeDownloadProgress: options.includeProgress
		}).pipe(shareIt());
	}

	/**
	 * Uploads a file to the specified endpoint
	 */
	static upload<T>(
		input: string | Request,
		file: File,
		options: ApiOptions = { includeProgress: true }
	) {
		const formData = new FormData();
		formData.append('avatar', file);
		return this.post<T>(input, formData, {
			...options,
			timeout: 3 * 60_000
		});
	}

	/**
	 * Makes a DELETE request to the specified endpoint
	 */
	static delete<T>(input: string | Request, body?: any, options: ApiOptions = {}) {
		return ApiService.post<T>(input, body, { ...options, method: 'DELETE' });
	}
}

// ─── Request Wrapper Class ───────────────────────────────────────

export class RequestWrap<TParams, TResponse extends AjaxResponse<any>> {
	readonly loading = new SvelteSubject<boolean>(false);
	readonly trigger = new Subject<TParams>();
	readonly response$: Observable<TResponse | undefined>;
	readonly errorMessage: Observable<string | undefined>;
	readonly error$: Observable<AjaxError | undefined>;
	readonly responseSuccess: Observable<TResponse | undefined>;

	private readonly clearErrorSubject = new Subject<undefined>();

	private readonly defaultOptions = {
		retryDelay: 0,
		retryCount: 0,
		retryMaxDelay: 60 * 1000,
		cacheResponse: false,
		startWithCache: false,
		requestOnSubscribe: false,
		global: false,
		successStatusCodes: SUCCESS_STATUS_CODES
	};

	constructor(
		private requestFn: RequestFunction<TParams, TResponse>,
		private options: RequestWrapOptions<TResponse> = {}
	) {
		const mergedOptions = { ...this.defaultOptions, ...options };
		const {
			interval,
			retryDelay,
			retryCount,
			retryMaxDelay,
			cacheResponse,
			startWithCache,
			localStorageKey,
			requestOnSubscribe,
			global,
			successStatusCodes,
			validateResponse,
			shouldTrigger,
			initialData,
			extractErrorMessage
		} = mergedOptions;

		const requestTrigger$ = this.createRequestTrigger(
			initialData,
			requestOnSubscribe,
			shouldTrigger
		);
		this.response$ = this.setupResponseStream(requestTrigger$, {
			interval,
			retryDelay,
			retryCount,
			retryMaxDelay,
			cacheResponse,
			startWithCache,
			localStorageKey,
			shouldTrigger,
			global
		});

		this.responseSuccess = this.setupSuccessStream(
			successStatusCodes,
			validateResponse,
			extractErrorMessage
		);
		this.errorMessage = this.setupErrorStream(extractErrorMessage);
		this.error$ = this.setupErrorObjectStream();
	}

	// ─── Public Methods ────────────────────────────────────────────────────────

	request = (params: TParams) => {
		this.trigger.next(params);
	};

	/**
	 * Clears any existing error state by emitting undefined to the response stream
	 * This will reset both errorMessage and error$ observables
	 */
	clearError = () => {
		this.clearErrorSubject.next(undefined);
	};

	// ─── Stream Setup Methods ──────────────────────────────────────────────────

	private createRequestTrigger(
		initialData: any,
		requestOnSubscribe: boolean,
		shouldTrigger?: Observable<boolean>
	): Observable<TParams> {
		return this.trigger.pipe(
			requestOnSubscribe
				? startWith((typeof initialData !== 'undefined' ? initialData : null) as any)
				: pipe(),
			switchMap((params) =>
				shouldTrigger
					? shouldTrigger.pipe(
							filter((v) => !!v),
							map(() => params),
							distinctUntilChanged()
						)
					: of(params)
			)
		);
	}

	private setupResponseStream(
		requestTrigger$: Observable<TParams>,
		options: Partial<RequestWrapOptions<TResponse>>
	): Observable<TResponse | undefined> {
		return requestTrigger$.pipe(
			tap(() => this.loading.next(true)),
			switchMap((params) => this.createRequestStream(params, options)),
			shareIt(!options.global)
		);
	}

	private createRequestStream(
		params: TParams,
		options: Partial<RequestWrapOptions<TResponse>>
	): Observable<TResponse | undefined> {
		let source$ = this.createBaseRequestStream(params, options);

		if (options.cacheResponse) {
			source$ = this.applyCaching(source$, options.localStorageKey);
		}

		if (options.startWithCache) {
			source$ = this.applyInitialCache(source$);
		}

		return source$.pipe(
			options.interval
				? tap(() => this.loading.next(false))
				: finalize(() => this.loading.next(false)),
			catchError((err) => {
				this.loading.next(false);
				return from(this.loadInitialCache()).pipe(catchError(() => of(undefined)));
			})
		);
	}

	private createBaseRequestStream(
		params: TParams,
		options: Partial<RequestWrapOptions<TResponse>>
	): Observable<TResponse> {
		const request$ = () =>
			this.requestFn(params).pipe(
				retryOnRetriable(options.retryCount!, options.retryDelay!, options.retryMaxDelay!),
				tap((v) => apiResponses$.next(v))
			);

		if (options.interval) {
			const interval$ = timer(0, options.interval);
			if (options.shouldTrigger) {
				return options.shouldTrigger.pipe(
					switchMap((trigger) => (trigger ? interval$.pipe(switchMap(() => request$())) : EMPTY))
				);
			} else {
				return interval$.pipe(switchMap(() => request$()));
			}
		} else {
			return request$();
		}
	}

	private setupSuccessStream(
		successStatusCodes: readonly number[],
		validateResponse?: (r: TResponse) => boolean,
		extractErrorMessage?: (r: TResponse) => string | undefined
	): Observable<TResponse | undefined> {
		return this.response$.pipe(
			map((r) => {
				if (!r || r instanceof AjaxError) return undefined;
				if (!successStatusCodes.includes(r.status as SuccessStatusCode)) return undefined;
				if (validateResponse && !validateResponse(r)) return undefined;

				if (extractErrorMessage) {
					const customError = extractErrorMessage(r);
					if (customError) {
						return undefined;
					}
				}

				return r;
			}),
			shareIt()
		);
	}

	private setupErrorStream(
		extractErrorMessage?: (r: TResponse) => string | undefined
	): Observable<string | undefined> {
		const errorMessageFromResponse$ = this.response$.pipe(
			map((r) => {
				if (!r) {
					return 'خطا در برقراری ارتباط. لطفاً از اتصال دستگاه به اینترنت مطمئن شوید';
				}

				if (r.status === 404) {
					return 'صفحه مورد نظر یافت نشد. لطفا مجدد تلاش کنید';
				}

				if (r instanceof AjaxError) {
					return this.extractErrorMessage(r) || undefined;
				}

				if (extractErrorMessage) {
					const customError = extractErrorMessage(r);
					if (customError) {
						return customError;
					}
				}

				return undefined;
			})
		);

		// Merge error message stream with clear error stream
		return merge(errorMessageFromResponse$, this.clearErrorSubject).pipe(
			map((value) => {
				// If clearErrorSubject emits undefined, clear the error message
				if (value === undefined) {
					return undefined;
				}
				// Otherwise return the error message as is
				return value as string | undefined;
			})
		);
	}

	private setupErrorObjectStream(): Observable<AjaxError | undefined> {
		const errorFromResponse$ = this.response$.pipe(
			map((response) => {
				if (response instanceof AjaxError) {
					return response;
				}
				return undefined;
			})
		);

		// Merge error stream with clear error stream
		return merge(errorFromResponse$, this.clearErrorSubject).pipe(
			map((value) => {
				// If clearErrorSubject emits undefined, clear the error
				if (value === undefined) {
					return undefined;
				}
				// Otherwise return the error as is
				return value as AjaxError | undefined;
			}),
			shareIt()
		);
	}

	// ─── Caching Methods ───────────────────────────────────────────────────────

	private applyCaching(
		source$: Observable<TResponse>,
		localStorageKey?: string
	): Observable<TResponse> {
		return source$.pipe(
			tap((result) => {
				if (typeof result === 'object' && 'error' in result && (result as any).error !== '') {
					return;
				}

				if (localStorageKey) {
					saveToLocalStorage(localStorageKey, {
						response: result.response,
						status: result.status
					});
				}
			})
		);
	}

	private applyInitialCache(source$: Observable<TResponse>): Observable<TResponse> {
		return source$.pipe(
			startWith(undefined),
			switchMap((result) => {
				if (result) return of(result);
				return from(this.loadInitialCache()).pipe(
					switchMap((cached) => of(result).pipe(startWith(cached)))
				);
			}),
			filter((data): data is TResponse => !!data)
		);
	}

	private async loadInitialCache(): Promise<TResponse | undefined> {
		const localStorageKey = this.options.localStorageKey;
		if (!localStorageKey) return undefined;

		const cachedData = await loadFromLocalStorage<TResponse>(localStorageKey);
		return cachedData ?? undefined;
	}

	// ─── Error Handling Methods ────────────────────────────────────────────────

	private extractErrorMessage(error: AjaxError): string | undefined {
		// Check for message in response
		if (error.response?.message) {
			const keys = Object.keys(error.response.message);
			if (keys[0] && error.response.message[keys[0]]?.msg) {
				return error.response.message[keys[0]].msg;
			}
		}

		// Check for errors in response
		if (error.response?.errors) {
			const keys = Object.keys(error.response.errors);
			if (keys[0] && error.response.errors[keys[0]]?.msg) {
				return error.response.errors[keys[0]].msg;
			}
		}

		return undefined;
	}
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

/**
 * Creates a new RequestWrap instance for managing API requests
 * @param requestFn - Function that performs the actual API request
 * @param options - Configuration options for the request wrapper
 * @returns A new RequestWrap instance
 */
export function useRequest<TParams, TResponse extends AjaxResponse<any>>(
	requestFn: RequestFunction<TParams, TResponse>,
	options: RequestWrapOptions<TResponse> = {}
): RequestWrap<TParams, TResponse> {
	return new RequestWrap<TParams, TResponse>(requestFn, options);
}
