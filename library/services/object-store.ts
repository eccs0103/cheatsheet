"use strict";

import "adaptive-extender/web";

//#region Object store
interface StoreOperation<T> {
	(store: IDBObjectStore): IDBRequest<T>;
}

export class ObjectStore {
	#database: string;
	#store: string;

	constructor(database: string, store: string) {
		this.#database = database;
		this.#store = store;
	}

	async #open(): Promise<IDBDatabase> {
		const store = this.#store;
		const request = indexedDB.open(this.#database, 1);
		return await Promise.withSignal<IDBDatabase>((signal, resolve, reject) => {
			request.addEventListener("upgradeneeded", () => {
				const database = request.result;
				if (database.objectStoreNames.contains(store)) return;
				database.createObjectStore(store);
			}, { signal });
			request.addEventListener("success", () => resolve(request.result), { signal });
			request.addEventListener("error", () => reject(request.error), { signal });
		});
	}

	// A write is only durable once its transaction completes; quota failures arrive as an abort after the request succeeded
	async #perform<T>(mode: IDBTransactionMode, operation: StoreOperation<T>): Promise<T> {
		const store = this.#store;
		const database = await this.#open();
		try {
			const transaction = database.transaction(store, mode);
			const request = operation(transaction.objectStore(store));
			await Promise.withSignal<void>((signal, resolve, reject) => {
				transaction.addEventListener("complete", () => resolve(), { signal });
				transaction.addEventListener("error", () => reject(transaction.error), { signal });
				transaction.addEventListener("abort", () => reject(transaction.error), { signal });
			});
			return request.result;
		} finally {
			database.close();
		}
	}

	async values(): Promise<unknown[]> {
		return await this.#perform("readonly", store => store.getAll());
	}

	async get(key: string): Promise<unknown> {
		return await this.#perform("readonly", store => store.get(key));
	}

	async put(key: string, value: unknown): Promise<void> {
		await this.#perform("readwrite", store => store.put(value, key));
	}

	async delete(key: string): Promise<void> {
		await this.#perform("readwrite", store => store.delete(key));
	}
}
//#endregion
