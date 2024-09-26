/* SPDX-License-Identifier: MIT
 * Copyright(c) 2024 Darek Stojaczyk
 */

'use strict';

const pg_init = async () => {
	await SW_LOADED;
	const sw_up_to_date = await update_sw();
	if (!sw_up_to_date) {
		/* we've purged the cache from SW, but the resources we've fetched
		 * so far  could be outdated as well -> reload to get the latest
		 * version of everything */
		window.location.reload();
		return;
	}

	const items = await get('/sw/items', { type: "json" });
	PG_DATA.items = items.data;

	await ItemHover.register();
	await ContextMenu.register();

	const page = new MainPage("main.tpl");
	await page.install(document.querySelector("#page"));

	document.querySelector('.header').addEventListener('mousedown', (e) => {
		// disable text selection after double clicking the button
		if (e.detail > 1) {
			e.preventDefault();
		}
	});
};

const update_sw = async () => {
	const sw_resp = await get("/sw/ver", { type: "text" });
	let sw_ver = 0;
	let vault_ver = 0;
	try {
		const json = JSON.parse(sw_resp.data);
		sw_ver = json.sw_ver;

		if (!json.prev_vault_ver || json.vault_ver != json.prev_vault_ver) {
			return false;
		}

		vault_ver = new Date(json.vault_ver).toLocaleDateString("en-US", { timeZone: "UTC" });
	} catch (e) {
		console.error("Failed to fetch local cached version");
	};

	const pg_resp = await get(ROOT_URL + "/pgver.php", { type: "text" });
	if (!pg_resp.ok) {
		if (sw_ver == 0) {
			console.error("Can't connect to projectgorgon.com and no local version saved");
			throw new Error("Can't connect to projectgorgon.com and no local version saved");
		}

		console.log("Can't connect to projectgorgon.com; Using local version " + sw_ver);
		return true;
	}

	const pg_ver = parseInt(pg_resp.data);
	console.log("Cached PG version = " + sw_ver + "; Latest version = " + pg_ver);

	document.querySelector("#vault_ver").textContent = vault_ver;
	document.querySelector("#pg_ver").textContent = pg_ver;

	if (sw_ver != pg_ver) {
		await post("/sw/ver", { ver: pg_ver }, { type: "text" });
	}

	return true;
}

class MainPage {
	constructor(name) {
		this.name = name;

		const preferences = JSON.parse(localStorage.getItem("preferences") || "{}");
		this.data = {
			page: this,
			characters: new Map(),
			preferences: {
				sort_by_storage: preferences.sort_by_storage ?? true,
			},
			query: "",
		};

		//this.hidden_storages = JSON.parse(localStorage.getItem("hidden_storages") || "[]");
		this.saved_files = JSON.parse(localStorage.getItem("uploaded") || "{}");
	}

	async install(page_el) {
		this.tpl = await load_tpl_once(this.name);
		this.el = await this.tpl.run(this.data);

		for (const filename in this.saved_files) {
			try {
				const json = this.saved_files[filename];
				this.add_report(filename, json);
			} catch (e) {
				console.error(e);
			}
		}

		this.reload_items();

		for (const c of page_el.children) { c.remove(); }
		page_el.appendChild(this.el);
	}

	async on_file_upload(ev) {
		const files = await json_file_chooser();
		for (const f of files) {
			try {
				const json = JSON.parse(f.text);
				this.add_report(f.name, json);
				this.saved_files[f.name] = json;
			} catch (e) {
				console.error(e);
			}
		}
		this.reload_items();
	}

	gen_item(item) {
		const item_data = PG_DATA.items["item_" + item.id];
		return "<picture data-pg-item-id=\"" + item.id + "\" \
				 data-pg-item-count=\"" + item.count + "\" \
				 data-pg-item-name=\"" + item.name + "\">\
					<img src=\"/sw/icon/" + item_data.IconId + "\">\
				</picture>";
	}

	add_report(filename, json) {
		const character = json.Character;
		const timestamp = json.Timestamp;

		if (json.Report !== "Storage") {
			throw new Error("Not a Storage report");
		}

		let storages = new Map();
		for (const item of json.Items) {
			let storage_name = item.StorageVault || "Inventory";
			let storage = storages.get(storage_name);
			if (!storage) {
				storage = {
					name: storage_name,
					items: new Set(),
				};
				storages.set(storage_name, storage);
			}
			storage.items.add({
				id: item.TypeID, count: item.StackSize, name: item.Name
			});
		}

		const order = this.data.characters.size + 1;
		this.data.characters.set(character, {
			name: character,
			order,
			filename,
			timestamp: timestamp,
			storages,
		});
	}

	reload_items() {
		localStorage.setItem("uploaded", JSON.stringify(this.saved_files));

		// We'll show account-shared storage only from the latest report
		const latest_char = [...this.data.characters.values()].reduce((latest, cur) => {
			const latest_ts = Date.parse(latest.timestamp);
			const cur_ts = Date.parse(cur.timestamp);
			return (cur_ts > latest_ts) ? cur : latest;
		}, { timestamp: 0 });
		this.data.latest_char = latest_char;

		this.tpl.reload('*');
		this.update_filters(this.data.preferences);
	}

	search_oninput(input_el) {
		const query = input_el.value;

		this.update_filters({ query });
	}

	filter_items(item_set) {
		if (!this.query) {
			return item_set;
		}

		const query_lc = this.query.toLowerCase();
		const items = [...item_set];
		return items.filter((item) => item.name.toLowerCase().includes(query_lc))
	}

	char_onclick(el, event) {
		const charname = el.dataset.charname;
		const char = this.data.characters.get(charname);

		ContextMenu.toggle(el, {
			entries: [
				{ name: "Date: " + char.timestamp },
				{
					name: "Remove", fn: () => {
						this.data.characters.delete(charname);
						delete this.saved_files[char.filename];
						this.reload_items();
					}
				}
			]
		}, event)
	}

	async sort_onclick(el, event) {
		ContextMenu.toggle(el, {
			tpl: await load_tpl_once("sort_menu.tpl"),
			tpl_data: { page: this }
		}, event)
	}

	async update_filters(updates = undefined) {
		let do_save_preferences = false;

		if (updates.query !== undefined) {
			this.data.query = updates.query;
			const query = this.data.query;
			// we calculate get max possible score without the appended whitespace
			// (the appended whitespace is only used to pop the exact matching words
			// higher, and it must not cause any items to be filtered-out)
			const max_score = string_similarity(query, query);

			let max_typos_penalty;
			if (query.length > 12) {
				// 3 lowercase chars can be mistyped
				// or 1 completely unmatched uppercase char + 2 char wrong case
				max_typos_penalty = 7;
			} else if (query.length > 10) {
				// 3 lowercase chars can be mistyped
				// or 1 completely unmatched uppercase char + 2 char wrong case
				max_typos_penalty = 6;
			} else if (query.length > 6) {
				// 2 lowercase chars can be mistyped
				max_typos_penalty = 4;
			} else if (query.length > 4) {
				// 3 chars can be wrong case,
				// or 1 lowercase char can be mistyped + 1 char wrong case
				max_typos_penalty = 3;
			} else if (query.length > 2) {
				// 2 chars can be wrong case
				// or 1 lowercase char can be mistyped
				max_typos_penalty = 2;
			} else if (query.length > 0) {
				// 1 char can be wrong case ('s' vs 'S')
				max_typos_penalty = 1;
			} else {
				max_typos_penalty = 0;
			}
			const min_score = max_score - max_typos_penalty;
			const do_append_whitespace = query.length > 3

			const container_els = this.el.querySelectorAll(".items .container");
			for (const container_el of container_els) {
				const char_name = container_el.dataset.pgCharName;
				let storage_name = container_el.dataset.pgName;
				const char = this.data.characters.get(char_name);
				const storage = char.storages.get(storage_name);

				const body_el = container_el.querySelector(".body");
				let max_score = 0;
				for (const item_el of body_el.children) {
					const score = string_similarity(query, item_el.dataset.pgItemName, do_append_whitespace);
					max_score = Math.max(max_score, score);
					if (score >= min_score) {
						item_el.classList.remove("hidden");
					} else {
						item_el.classList.add("hidden");
					}
					item_el.style = "order: " + -score;
				}
				container_el.style = "order: " + -max_score;
			}
		}

		if (updates.sort_by_storage !== undefined) {
			this.data.preferences.sort_by_storage = updates.sort_by_storage;
			do_save_preferences = true;
		}

		if (updates.sort_by_storage !== undefined || updates.query === "") {
			const container_els = this.el.querySelectorAll(".items .container");
			for (const container_el of container_els) {
				const char_name = container_el.dataset.pgCharName;
				let storage_name = container_el.dataset.pgName;

				const char = this.data.characters.get(char_name);
				const storage = char.storages.get(storage_name);

				let order;
				const char_order = char.order;
				const storage_order = PG_DATA.storage_order[storage.name] ?? 100;
				if (updates.sort_by_storage) {
					order = storage_order * 1000 + char_order;
				} else {
					order = char_order * 1000 + storage_order
				}
				container_el.style = "order: " + order;
			}
		}

		if (do_save_preferences) {
			localStorage.setItem("preferences", JSON.stringify(this.data.preferences));
		}
	}
}

const PG_LOADED = pg_init();
