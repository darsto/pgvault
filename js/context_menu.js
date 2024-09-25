/* SPDX-License-Identifier: MIT
 * Copyright(c) 2024 Darek Stojaczyk
 */

'use strict';

class ContextMenu {
    static instance = null;
    static async register() {
        let menu = new ContextMenu();
        Object.assign(menu, await new_shadow_tpl_el("context_menu.tpl", {}));
        menu.context_el = undefined;
        document.body.querySelector("#overlays").appendChild(menu.dom);
        ContextMenu.instance = menu;

        document.querySelector("#content").addEventListener('scroll', (e) => {
            /* since the tooltip is position: fixed,
             * it won't scroll, and will look off. Just hide it */
            menu.tpl.reload('*', {});
            menu.context_el = undefined;
        });
    }

    static open(el, data, event = null) {
        return ContextMenu.instance._open(el, data, event);
    }

    _open(el, data, event) {
        if (event) {
            // prevent immediate closing
            event.stopPropagation();
        }

        this.context_el = el;
        this.tpl.reload("*", data);

        const menu_el = this.shadow.querySelector("#context-menu");
        const tooltip_bounds = menu_el.getBoundingClientRect();
        const el_bounds = el.getBoundingClientRect();
        const dom_bounds = document.body.getBoundingClientRect();

        const margin = 0;
        const pos = { top: window.scrollY + el_bounds.bottom + margin, left: window.scrollX + el_bounds.left };
        if (el_bounds.left + tooltip_bounds.width > window.scrollX + dom_bounds.right) {
            pos.left = window.scrollX + el_bounds.right - tooltip_bounds.width
            if (pos.left < 0) {
                pos.left = 0;
            }
        }

        menu_el.style = "left: " + pos.left + "px; top: " + pos.top + "px";
        document.body.addEventListener('click', ContextMenu.close);
    }

    static close() {
        return ContextMenu.instance._close();
    }

    _close() {
        document.body.removeEventListener('click', ContextMenu.close);
        this.context_el = undefined;
        const menu_el = this.shadow.querySelector("#context-menu");
        menu_el.style = "z-index: -200; visibility: hidden; pointer-events: none;";
    }

    static toggle(el, data, event = null) {
        return ContextMenu.instance._toggle(el, data, event);
    }

    _toggle(el, data, event) {
        if (el == this.context_el) {
            /* i.e. double clicking the same button */
            this._close();
        } else {
            this._open(el, data, event);
        }
    }
}
