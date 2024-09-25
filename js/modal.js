/* SPDX-License-Identifier: MIT
 * Copyright(c) 2024 Darek Stojaczyk
 */

'use strict';

class Modal {
	static prev_modal = null;

	static async open(tpl_name) {
		const modal = new Modal();
		modal.tpl = await load_tpl_once(tpl_name);

		const inner_el = await modal.tpl.run({ page: modal });

		if (Modal.prev_modal) {
			Modal.prev_modal.close()
		}

		modal.dom = document.createElement('div');
		modal.shadow = modal.dom.attachShadow({ mode: 'open' });
		modal.shadow.appendChild(inner_el);
		Modal.prev_modal = modal;

		const onload_event = dom_prepend_async(modal.shadow, [
			new_css(ROOT_URL + "/css/style.css"),
			new_css(ROOT_URL + "/css/font-awesome.min.css"),
		]);

		modal.dom.style = "display: none";
		document.body.querySelector("#overlays").appendChild(modal.dom);
		await onload_event;
		modal.dom.style = "";

		return modal;
	}

	close() {
		this.dom.remove();
	}
}
