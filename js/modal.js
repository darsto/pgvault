/* SPDX-License-Identifier: MIT
 * Copyright(c) 2024 Darek Stojaczyk
 */

'use strict';

class Modal {
	static prev_modal = null;

	static async open(tpl_name, tpl_args = null) {
		const modal = new Modal();
		modal.tpl = await load_tpl_once(tpl_name);

		const inner_el = await modal.tpl.run({ page: modal, ...tpl_args });

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
		if (this.onclose) {
			this.onclose();
		}
		this.dom.remove();
	}
}

class ModalConfirm {
	static async open(header, content, extra_args) {
		const modal = await Modal.open('confirm.tpl', { header, content, ...extra_args });
		await new Promise((resolve) => {
			modal.onclose = resolve;
		});
		return modal.confirmed ?? false;
	}
}

class ModalLoader {
	static el = null;

	static open(text) {
		if (!ModalLoader.el) {
			ModalLoader.el = document.querySelector("#loader");
		}

		const el = ModalLoader.el;
		el.style = "display: block;";

		return {
			close: () => {
				el.style = "";
			}
		};
	}
}
