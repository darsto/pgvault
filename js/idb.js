/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk
 */

class IDB {
	static async open(table, ver, mode = 'readonly') {
		const db = await new Promise((resolve) => {
			const request = indexedDB.open(table, ver);
			request.onerror = () => resolve(null);

			request.onsuccess = () => {
				resolve(request.result);
			};

			request.onupgradeneeded = (e) => {
				const db = e.target.result;
				if (e.oldVersion) {
					db.deleteObjectStore('entries');
				}
				db.createObjectStore('entries', { keyPath: 'id' });
				e.target.oncomplete = (e) => {
					resolve(db);
				}
			}
		});

		return new IDB(db.transaction(['entries'], mode).objectStore('entries'));
	}

    constructor(db) {
		this.inner = db;
    }

	get(id) {
		return new Promise((resolve, reject) => {
			const request = this.inner.get(id);
			request.onerror = reject;
			request.onsuccess = () => {
				const resp = request.result;
				resolve(resp ? resp.val : undefined);
			};
		});
	}

	set(id, val) {
		return new Promise((resolve, reject) => {
			const request = this.inner.put({ id, val });
			request.onerror = reject;
			request.onsuccess = resolve;
		});
	}
}
