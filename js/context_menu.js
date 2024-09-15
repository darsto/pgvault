/* SPDX-License-Identifier: MIT
 * Copyright(c) 2024 Darek Stojaczyk
 */

'use strict';

class ContextMenu {
    static instance = null;
    static async register() {
        let menu = new ContextMenu();
        menu.tpl = await load_tpl_once("context_menu.tpl");

        const el = await menu.tpl.run({ entries: [] });
        document.body.querySelector("#overlays").appendChild(el);

        menu.el = el;
        menu.context_el = null;
        ContextMenu.instance = menu;
    }

    static open(el, entries, event = null) {
        return ContextMenu.instance._open(el, entries, event);
    }

    _open(el, entries, event) {
        if (event) {
            // prevent immediate closing
            event.stopPropagation();
        }

        this.context_el = el;
        this.tpl.reload("*", {
            entries,
        });

        const menu_el = this.el.querySelector("#context-menu");
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
        this.context_el = null;
        const menu_el = this.el.querySelector("#context-menu");
        menu_el.style = "z-index: -200; visibility: hidden; pointer-events: none;";
    }

    static toggle(el, entries, event = null) {
        return ContextMenu.instance._toggle(el, entries, event);
    }

    _toggle(el, entries, event) {
        if (el == this.context_el) {
            /* i.e. double clicking the same button */
            this._close();
        } else {
            this._open(el, entries, event);
        }
    }
}
