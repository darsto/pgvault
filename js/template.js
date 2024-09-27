/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk
 * https://raw.githubusercontent.com/darsto/jstemplate/master/template.js
 */

'use strict';

class Template {
	static tpl_map = new WeakMap();
	static tpl_map_idx = 0;
	static tpl_id_map = {};

	constructor(name) {
		this.name = name;
		this.var_map = new Map();
		this.vars = [];
		this.id = Template.tpl_map_idx++;

		/* weak map keys can't be primitives, so use a dummy object */
		const id_obj = Template.tpl_id_map[this.id] = {};
		Template.tpl_map.set(id_obj, this);
	}

	get_var_id(obj) {
		let id = this.var_map.get(obj);
		if (id == undefined) {
			id = this.vars.push(obj) - 1;
			this.var_map.set(obj, id);
		}
		return id;
	}

	static get_by_id(id) {
		const id_obj = Template.tpl_id_map[id];
		return Template.tpl_map.get(id_obj);
	}

	static build(str) {
		const append_s = '\nout += ';
		const content = str
			.replace(/(^\s+|\s+$)/gm, '' /* trim each line (tabs & spaces) */)
			.replace(/\n/g, '' /* don't break `out` with multi-line strings */)
			.replace(/"/g, '\\"' /* escape double quotes */)
			.replace(/{@@(.*?)@@}/g, (match, content) => { /* raw text block */
				return content
					.replace(/{/g, "&#123;").replace(/}/g, "&#125;" /* mangle braces so they're not processed below */)
			})
			.replace(/{(.*?[^\\])}/g, (match, content) => { /* for each code block */
				return '";\n' + content
					.replace(/\\"/g, '"' /* don't escape double quotes -> they're real strings now */)
					.replace(/\$/g, "local." /* $ variable access */)
					.replace(/^assign (.*)$/, "local.$1;" /* setup new $ variable */)
					.replace(/^(?:foreach|for) \s*(.*?)\s*=(.*?);(.*?);(.*?)$/, "{const _bckup_name=\"$1\"; const _bckup=local[_bckup_name]; for (let $1 =$2;$3;$4) { local[_bckup_name] = $1;" /* make the local variable available with $variable syntax, so also backup the previous value of local[var_name] */)
					.replace(/^(?:foreach|for) (.*) (of|in) (.*)$/, "{const _bckup_name=\"$1\"; const _bckup=local[_bckup_name]; for (const $1 $2 $3) { local[_bckup_name] = $1;")
					.replace(/^\/(foreach|for)$/g, "}; local[_bckup_name] = _bckup; };" /* restore local[var_name] from before the loop */)
					.replace(/^if (.*)$/g, ";if ($1) {")
					.replace(/^else$/g, "} else {")
					.replace(/^else if (.*)$/g, "} else if ($1) {")
					.replace(/^\/if$/g, "}")
					.replace(/^serialize (.*)$/g, (match, content) => {
						return append_s + '"Template.get_by_id(" + tpl.id + ").vars[" + tpl.get_var_id(' + content + ') + "]"';
					})
					.replace(/^hascontent$/g, "{const _bckup = out; let _has_cntnt = false; {")
					.replace(/^content$/g, "{ const _bckup = out; {")
					.replace(/^\/content$/g, "} _has_cntnt = _bckup != out; }")
					.replace(/^\/hascontent$/g, "} if (!_has_cntnt) out = _bckup; }")
					.replace(/^@(.*)/g, (match, content) => { /* text block */
						return append_s + '(' + content + ');';
					})
				+ append_s + '"';
			})
			.replace(/&#123;/g, '{').replace(/&#125;/g, '}' /* un-mangle braces */)
			.replace(/\\}/g, '}' /* get rid of escaped braces */);
		;
		return '\'use strict\';\nlet out = "' + content + '";\nreturn out;';
	}

	compile() {
		const tpl_script = document.getElementById(this.name);
		if (!tpl_script) {
			throw new Error('Template script ' + this.name + ' doesn\'t exist');
		}
		const script_text = tpl_script.text;

		const el = document.createElement('template');
		el.innerHTML = script_text;

		this.raw_data = el;

		const f_text = Template.build(script_text);
		this.func = new Function('tpl', 'local', f_text);
	}

	run_raw(args = {}) {
		if (!this.func) {
			this.compile();
		}

		this.args = args;
		return this.func(this, args);
	}

	run(args = {}) {
		const html_str = this.run_raw(args);

		const el = document.createElement('div');
		el.jsTemplate = this;
		el.innerHTML = html_str;
		if (this.compile_cb) {
			this.compile_cb(el);
		}
		this.data = el;
		return this.data;
	}

	reload(selector, args = this.args) {
		const raw = this.raw_data.content.querySelector(selector);
		const real = this.data.querySelector(selector);
		if (!raw || !real) {
			return false;
		}

		/* fix outerHTML mangling some (technically invalid) syntax */
		const raw_str = raw.outerHTML
				.replace(/&amp;/g, '&')
				.replace(/\{if="" /g, '{if ')
				.replace(/&lt;/g, '<')
				.replace(/&gt;/g, '>')
		;
		const new_fn_text = Template.build(raw_str);
		const new_fn = new Function('tpl', 'local', new_fn_text);

		const new_real = document.createElement('template');
		new_real.innerHTML = new_fn(this, args);

		const new_el = new_real.content.firstElementChild;
		real.replaceWith(new_el);

		if (this.compile_cb) {
			this.compile_cb(new_el);
		}
	}
}
