/* SPDX-License-Identifier: MIT
 * Copyright(c) 2024 Darek Stojaczyk
 */

'use strict';

self.addEventListener('activate', (event) => {
	event.waitUntil(clients.claim());
});

self.addEventListener('message', e => {
	if (e.data === 'skipWaiting') {
		skipWaiting();
	}
});

self.addEventListener('fetch', (event) => {
	const req = event.request;

	/* don't cache cross-origin */
	if (!req.url.startsWith(self.location.origin)) return;

	const url = req.url.substring(self.location.origin.length);
    const filename = url.split('?')[0];

	const ret = caches.match(url, { ignoreVary: true }).then(async (cached) => { try {
		if (cached) {
			return cached;
		}

		const args_arr = [ filename ];
		const fn = match_handler(req, filename, args_arr);
		if (!fn) {
			let resp;
			try {
				resp = await fetch(req);
			} catch (e) {
				return new Response('', { status: 502, statusText: 'Bad Gateway',
					headers: { 'Content-Type': 'text/plain' }
				});
			}
			if (!DEBUG && resp.ok) {
				const basename = resp.url.split('/').pop();
				const CACHEABLE_EXT = [ "js", "tpl", "css", "png", "jpeg", "jpg", "ico", "woff2", "woff2?v=4.7.0" ];
				if (filename == ROOT_URL + "/" || CACHEABLE_EXT.some(ext => basename.endsWith(ext))) {
					const runtime = await runtime_data();
					if (runtime) {
						runtime.cache.put(req, resp.clone());
					}
				}
			}
			return resp;
		}

		req.params = new Map();
		try {
			/* flesh-out POST data for easier access */
			if (req.method === 'POST') {
				const form_data = await req.formData();
				for (const e of form_data.entries()) {
					req.params.set(e[0], e[1]);
				}
			}
		} catch (e) {}

		return await fn(req, args_arr);
	} catch (e) { console.error(e); }});

	event.respondWith(ret);
});

try {
	self.importScripts('config.js');
} catch (e) {
	const DEBUG = 0;
	const ROOT_URL = "";
}

let PG_DATA = null;
const pg_data = async () => {
	if (PG_DATA) {
		return PG_DATA;
	}

	let cached_pg_ver = 0;
	const cache_names = await caches.keys();
	for (const name of cache_names) {
		if (name.startsWith("pgdata-v")) {
			const ver = parseInt(name.substring("pgdata-v".length));
			cached_pg_ver = Math.max(cached_pg_ver, ver);
		}
	}

	if (!cached_pg_ver) {
		console.error("Couldn't find PG data cache. Please reload");
		return null;
	}

	const cache = await caches.open("pgdata-v" + cached_pg_ver);
	PG_DATA = { ver: cached_pg_ver, cache };
	return PG_DATA;
}

let RUNTIME_DATA = null;
const runtime_data = async () => {
	if (RUNTIME_DATA) {
		return RUNTIME_DATA;
	}

	let cached_local_ver = 0;
	const cache_names = await caches.keys();
	for (const name of cache_names) {
		if (name.startsWith("precache-v")) {
			const ver = parseInt(name.substring("precache-v".length));
			cached_local_ver = Math.max(cached_local_ver, ver);
		}
	}

	if (!cached_local_ver) {
		return null;
	}

	const cache = await caches.open("precache-v" + cached_local_ver);
	RUNTIME_DATA = { ver: cached_local_ver, cache };
	return RUNTIME_DATA;
}


const HANDLER_URL_TREE = Object.create(null);
const URL_FN_SYMBOL = Symbol();

/**
 * Call function handler for given url.
 *
 * \return handler function or undefined if none found
 */
const match_handler = (req, url, args_arr) => {
	if (url.endsWith('/')) {
		url = url.slice(0, -1);
	}
	const parts = url.split('/');

	if (parts.length < 2) {
		return undefined;
	}

	let tree = HANDLER_URL_TREE;
	let handler = null;

	for (let i = 1; i < parts.length; i++) {
		let p = parts[i];

		if (tree['*']) {
			args_arr.push(p);
			p = '*';
		}

		if (tree[p]) {
			tree = tree[p];
			if (tree[URL_FN_SYMBOL]) {
				handler = tree[URL_FN_SYMBOL];
			}
		} else {
			break;
		}
	}

	return handler;
};

const validate_tree = (t) => {
	if (t['*'] && Object.keys(t).length > 1) {
		return false;
	}

	return true;
};

const register_url = (url, fn) => {
	const parts = url.split('/');

	let tree = HANDLER_URL_TREE;
	for (let i = 1; i < parts.length; i++) {
		const p = parts[i];

		let entry = tree[p];
		if (!entry) {
			entry = Object.create(null);
			tree[p] = entry;
		}
		if (!validate_tree(tree)) {
			throw new Error('Registered conflicting URLs: ' + url);
		}

		tree = entry;
	}

	if (tree[URL_FN_SYMBOL]) {
		throw new Error('Registered conflicting URLs: ' + url);
	}

	tree[URL_FN_SYMBOL] = fn;
};

register_url('/sw/ver', async (req, args) => {
	if (req.method === "GET") {
		return sw_ver_get(req);
	} else if (req.method === "POST") {
		return sw_ver_post(req);
	} else {
		return new Response('', { status: 400, statusText: 'Bad Request',
			headers: { 'Content-Type': 'text/plain' }
		});
	}
});

register_url('/sw/icon/*', async (req, args) => {
	let id = parseInt(args[1]);
	if (!id) {
		id = 0;
	}

	const pg = await pg_data();
	const icon_buf = await Icon.get(pg.ver, id);
	let resp = new Response(icon_buf, {
		status: 200, statusText: 'OK', headers: { 'Content-Type': 'image/png' }
	});

	pg.cache.put(req, resp.clone());
	return resp;
});

register_url('/sw/items', async (req, args) => {
	const pg = await pg_data();
	const url = "https://cdn.projectgorgon.com/v" + pg.ver + "/data/items.json";
	let resp = await fetch(url);

	pg.cache.put(req, resp.clone());
	return resp;
});

const sw_ver_get = async (req) => {
	const date = new Date();
	const runtime = await runtime_data();
	const prev_localver = runtime?.ver || 0;
	let new_localver = 0;
	try {
		const localver_resp = await fetch(ROOT_URL + '/localver.php');
		new_localver = parseInt(await localver_resp.text());
	} catch (e) {}
	console.log("/sw/ver: Local version " + new_localver);

	/* remove stale precaches and get cached_pg_ver */
	let cached_pg_ver = 0;
	const cache_names = await caches.keys();
	for (const name of cache_names) {
		if (req.method === "GET" && name.startsWith("precache-v") && name != "precache-v" + new_localver) {
			console.log("/sw/ver: Deleting stale '" + name + "'");
			caches.delete(name);
		}

		if (name.startsWith("pgdata-v")) {
			const ver = parseInt(name.substring("pgdata-v".length));
			cached_pg_ver = Math.max(cached_pg_ver, ver);
		}
	}

	const ver = {
		sw_ver: cached_pg_ver,
		prev_vault_ver: prev_localver,
		vault_ver: new_localver,
	};

	const cache = await caches.open("precache-v" + new_localver);
	RUNTIME_DATA = { ver: new_localver, cache };

	return new Response(JSON.stringify(ver), { status: 200, statusText: 'OK',
		headers: { 'Content-Type': 'application/json', 'Date': date.toGMTString() }
	});
}

const sw_ver_post = async (req) => {
	const date = new Date();
	const latest_pg_ver = req.params.get('ver');

	/* remove stale pg data */
	const cache_names = await caches.keys();
	for (const name of cache_names) {
		if (name.startsWith("pgdata-v") && name != "pgdata-v" + latest_pg_ver) {
			console.log("/sw/ver/*: Deleting stale '" + name + "'");
			caches.delete(name);
		}
	}

	const cache = await caches.open("pgdata-v" + latest_pg_ver);
	PG_DATA = { ver: latest_pg_ver, cache };

	return new Response('', { status: 200, statusText: 'OK',
		headers: { 'Content-Type': 'text/plain', 'Date': date.toGMTString() }
	});
}

class Icon {
    static missing_icon = null;

    static async missing_icon() {
		if (Item.missing_icon) {
			return Item.missing_icon;
		}

        const resp = await fetch(ROOT_URL + '/images/missing_icon.png');
		Icon.missing_icon = await resp.arrayBuffer();
		return Item.missing_icon;
    }

	static async get(pg_ver, id) {
        let url = 'https://cdn.projectgorgon.com/v' + pg_ver + '/icons/icon_' + id + '.png';
        const resp = await fetch(url);
        if (!resp.ok) {
            console.warn('Fetch failed: ' + url);
            return await Icon.missing_icon();
        }

        const buf = await resp.arrayBuffer();
		return buf;
	}
}
