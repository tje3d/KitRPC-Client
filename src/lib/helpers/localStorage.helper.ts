import { browser } from '$app/environment';
import { jsonDecodeWorker, jsonEncodeWorker } from '$lib/helpers/jsonWorker.helper';

export async function saveToLocalStorage(key: string, data: any) {
	if (!browser) {
		return false;
	}

	try {
		return new Promise((resolve) => {
			jsonEncodeWorker<string>(data).subscribe((v) => {
				localStorage.setItem(key, v);
				resolve(true);
			});
		});
	} catch (e) {
		console.error('Failed to save data to localStorage', e);
		return false;
	}
}

export async function loadFromLocalStorage<T>(key: string): Promise<T | null> {
	if (!browser) {
		return null;
	}

	try {
		const serializedData = localStorage.getItem(key);
		if (serializedData === null) {
			return null;
		}

		return new Promise<T>((resolve) => {
			jsonDecodeWorker<T>(serializedData).subscribe((data) => {
				resolve(data);
			});
		});
	} catch (e) {
		console.error('Failed to load data from localStorage', e);
		if (browser) {
			localStorage.removeItem(key);
		}
		return null;
	}
}

export async function removeFromLocalStorage(key: string): Promise<void> {
	if (!browser) {
		return;
	}

	localStorage.removeItem(key);
}
