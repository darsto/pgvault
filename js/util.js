/* SPDX-License-Identifier: MIT
 * Copyright(c) 2024 Darek Stojaczyk
 */

const fetch_all = async (url, params) => {
    const type = params.type;
    delete params.type;
    const resp = await fetch(url, params);
    if (type) {
        try {
            if (type == "json") {
                resp.data = await resp.json();
            } else {
                resp.data = await resp.text();
            }
        } catch (err) {
            resp.ok = false;
            resp.err = err;
        }
    }
    return resp;
}

const get = async (url, params) => {
    if (!params) {
        params = {};
    }
	return fetch_all(url, params);
}

const post = async (url, data, params) => {
    if (!params) {
        params = {};
    }

	const form_data = new FormData();
	for (const field in data) {
		if (typeof(data[field]) == 'object' && !(data[field] instanceof File)) {
			Object.entries(data[field]).forEach((v, k) => form_data.append(`${field}[${v[0]}]`, v[1]));
		} else {
			form_data.append(field, data[field]);
		}
	}
    params.method = "POST";
    params.body = form_data;

	return fetch_all(url, params);
}

const new_css_async = async (url) => {
	const style = document.createElement('style');
	const resp = await get(url, { type: "text" });
	style.textContent = resp.data;
	return style;
}

const new_css = (url) => {
	const link = document.createElement('link');
	link.rel = 'stylesheet';
	link.type = 'text/css';
	link.href = url;
	return link;
}

const new_fontawesome_font = () => {
	const link = document.createElement('link');
	link.href = ROOT_URL + "/fonts/fontawesome-webfont.woff2";
	link.type = 'font/woff2';
	link.as = "font";
	link.crossOrigin = "";
	return link;
}

const dom_prepend_async = (dom, els) => {
	return Promise.all(
		els.map((el) => new Promise((resolve) => {
			el.onload = (e) => {
				resolve();
			}
			dom.prepend(el);
		}))
	);
}

const find_tpls = (parent, name, list) => {
	for (const c of parent.children) {
		if (c.jsTemplate && c.jsTemplate.name == name) {
			list.push(c);
		}

		if (c.shadowRoot) {
			find_tpls(c.shadowRoot, name, list);
		} else {
			find_tpls(c, name, list);
		}
	}
}

const TPL_GENERATION = {};
const load_tpl = async (name) => {
	const file = await get(ROOT_URL + '/tpl/' + name, { type: "text" });
	if (!file.ok) {
		throw new Error('Failed to load template: ' + name);
	}

	const prev = document.getElementById(name);
	if (prev) {
		prev.remove();
	}

	const script_el = document.createElement('script');
	script_el.type = 'text/x-jstemplate';
	script_el.innerHTML = file.data;
	const id = name;
	script_el.id = id;

	document.head.insertAdjacentElement('beforeend', script_el);
	TPL_GENERATION[id] = (TPL_GENERATION[id] + 1) || 1;

	if (typeof TPL_DEBUG !== 'undefined') {
		const tpl_els = [];
		find_tpls(document.body, id, tpl_els);

		for (const el of tpl_els) {
			const t = el.jsTemplate;
			el.replaceWith(t.run(t.args));
		}
	}

	return script_el;
}

const load_tpl_once = async (name) => {
	if (!TPL_GENERATION[name]) {
		await load_tpl(name);
	}

    return new Template(name);
}

const new_shadow_tpl_el = async (tpl_name, tpl_data) => {
	const obj = {};
	obj.tpl = await load_tpl_once(tpl_name);

	const inner_el = await obj.tpl.run({ obj: obj, ...tpl_data });
	obj.dom = document.createElement('div');
	obj.shadow = obj.dom.attachShadow({ mode: 'open' });
	obj.shadow.appendChild(inner_el);

	const onload_event = dom_prepend_async(obj.shadow, [
		new_css(ROOT_URL + "/css/style.css"),
		new_css(ROOT_URL + "/css/font-awesome.min.css"),
	]);

	obj.dom.style = "display: none";
	onload_event.then(() => {
		obj.dom.style = "";
	});

	return obj;
}

const json_file_chooser = () => {
    return new Promise(resolve => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file')
        input.setAttribute('multiple', 'true')
        input.setAttribute('accept', 'application/json')

        input.addEventListener('change', async (ev) => {
            const files = ev.target.files;
            if (!files) {
                return
            }

            const promises = [...files].map(file => file.text());
            const contents = await Promise.all(promises);

            let ret = [];
            for (let i = 0; i < files.length; i++) {
                ret.push({ name: files[i].name, text: contents[i] });
            }
            resolve(ret);
        }, false);
        input.click()
    });
}
