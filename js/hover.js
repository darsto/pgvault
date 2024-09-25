/* SPDX-License-Identifier: MIT
 * Copyright(c) 2024 Darek Stojaczyk
 */

'use strict';

class ItemHover {
    static async register() {
        let hover = new ItemHover();
        hover.tpl = await load_tpl_once("item_tooltip.tpl");

        const el = await hover.tpl.run({});
        hover.el = el;
        document.body.querySelector("#overlays").appendChild(el);

        hover.prev_el = undefined;
        document.addEventListener('mousemove', (e) => {
            const path = e.composedPath();
            const el = path?.find(el => el?.dataset?.pgItemId);

            if (el === hover.prev_el) {
                return;
            }
            hover.prev_el = el;

            if (el) {
                const item = { id: el.dataset.pgItemId, name: el.dataset.pgItemName };
                const item_type = PG_DATA.items["item_" + item.id];
                hover.tpl.reload('*', {
                    item,
                    item_type,
                });

                const tooltip_el = hover.el.querySelector("#item-tooltip");
                const tooltip_bounds = tooltip_el.getBoundingClientRect();
                const el_bounds = el.getBoundingClientRect();
                const dom_bounds = document.body.getBoundingClientRect();

                const margin = 4;
                const pos = { top: el_bounds.top, left: el_bounds.right + margin };
                if (el_bounds.right + margin + tooltip_bounds.width > dom_bounds.right) {
                    pos.left = el_bounds.left - tooltip_bounds.width - margin;
                    if (pos.left < 0) {
                        pos.left = 0;
                    }
                }

                tooltip_el.style = "left: " + pos.left + "px; top: " + pos.top + "px";
            } else {
                hover.tpl.reload('*', {});
            }
        }, { passive: true });


        document.querySelector("#content").addEventListener('scroll', (e) => {
            /* since the tooltip is position: fixed,
             * it won't scroll, and will look off. Just hide it */
            hover.tpl.reload('*', {});
            hover.prev_el = undefined;
        });
    }
}
