(function () {
	'use strict';

	/** @returns {void} */
	function noop() {}

	const identity = (x) => x;

	function run(fn) {
		return fn();
	}

	function blank_object() {
		return Object.create(null);
	}

	/**
	 * @param {Function[]} fns
	 * @returns {void}
	 */
	function run_all(fns) {
		fns.forEach(run);
	}

	/**
	 * @param {any} thing
	 * @returns {thing is Function}
	 */
	function is_function(thing) {
		return typeof thing === 'function';
	}

	/** @returns {boolean} */
	function safe_not_equal(a, b) {
		return a != a ? b == b : a !== b || (a && typeof a === 'object') || typeof a === 'function';
	}

	/** @returns {boolean} */
	function is_empty(obj) {
		return Object.keys(obj).length === 0;
	}

	/** @param {number | string} value
	 * @returns {[number, string]}
	 */
	function split_css_unit(value) {
		const split = typeof value === 'string' && value.match(/^\s*(-?[\d.]+)([^\s]*)\s*$/);
		return split ? [parseFloat(split[1]), split[2] || 'px'] : [/** @type {number} */ (value), 'px'];
	}

	const is_client = typeof window !== 'undefined';

	/** @type {() => number} */
	let now = is_client ? () => window.performance.now() : () => Date.now();

	let raf = is_client ? (cb) => requestAnimationFrame(cb) : noop;

	const tasks = new Set();

	/**
	 * @param {number} now
	 * @returns {void}
	 */
	function run_tasks(now) {
		tasks.forEach((task) => {
			if (!task.c(now)) {
				tasks.delete(task);
				task.f();
			}
		});
		if (tasks.size !== 0) raf(run_tasks);
	}

	/**
	 * Creates a new task that runs on each raf frame
	 * until it returns a falsy value or is aborted
	 * @param {import('./private.js').TaskCallback} callback
	 * @returns {import('./private.js').Task}
	 */
	function loop(callback) {
		/** @type {import('./private.js').TaskEntry} */
		let task;
		if (tasks.size === 0) raf(run_tasks);
		return {
			promise: new Promise((fulfill) => {
				tasks.add((task = { c: callback, f: fulfill }));
			}),
			abort() {
				tasks.delete(task);
			}
		};
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @returns {void}
	 */
	function append(target, node) {
		target.appendChild(node);
	}

	/**
	 * @param {Node} target
	 * @param {string} style_sheet_id
	 * @param {string} styles
	 * @returns {void}
	 */
	function append_styles(target, style_sheet_id, styles) {
		const append_styles_to = get_root_for_style(target);
		if (!append_styles_to.getElementById(style_sheet_id)) {
			const style = element('style');
			style.id = style_sheet_id;
			style.textContent = styles;
			append_stylesheet(append_styles_to, style);
		}
	}

	/**
	 * @param {Node} node
	 * @returns {ShadowRoot | Document}
	 */
	function get_root_for_style(node) {
		if (!node) return document;
		const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
		if (root && /** @type {ShadowRoot} */ (root).host) {
			return /** @type {ShadowRoot} */ (root);
		}
		return node.ownerDocument;
	}

	/**
	 * @param {Node} node
	 * @returns {CSSStyleSheet}
	 */
	function append_empty_stylesheet(node) {
		const style_element = element('style');
		// For transitions to work without 'style-src: unsafe-inline' Content Security Policy,
		// these empty tags need to be allowed with a hash as a workaround until we move to the Web Animations API.
		// Using the hash for the empty string (for an empty tag) works in all browsers except Safari.
		// So as a workaround for the workaround, when we append empty style tags we set their content to /* empty */.
		// The hash 'sha256-9OlNO0DNEeaVzHL4RZwCLsBHA8WBQ8toBp/4F5XV2nc=' will then work even in Safari.
		style_element.textContent = '/* empty */';
		append_stylesheet(get_root_for_style(node), style_element);
		return style_element.sheet;
	}

	/**
	 * @param {ShadowRoot | Document} node
	 * @param {HTMLStyleElement} style
	 * @returns {CSSStyleSheet}
	 */
	function append_stylesheet(node, style) {
		append(/** @type {Document} */ (node).head || node, style);
		return style.sheet;
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @param {Node} [anchor]
	 * @returns {void}
	 */
	function insert(target, node, anchor) {
		target.insertBefore(node, anchor || null);
	}

	/**
	 * @param {Node} node
	 * @returns {void}
	 */
	function detach(node) {
		if (node.parentNode) {
			node.parentNode.removeChild(node);
		}
	}

	/**
	 * @template {keyof HTMLElementTagNameMap} K
	 * @param {K} name
	 * @returns {HTMLElementTagNameMap[K]}
	 */
	function element(name) {
		return document.createElement(name);
	}

	/**
	 * @param {string} data
	 * @returns {Text}
	 */
	function text(data) {
		return document.createTextNode(data);
	}

	/**
	 * @returns {Text} */
	function space() {
		return text(' ');
	}

	/**
	 * @returns {Text} */
	function empty() {
		return text('');
	}

	/**
	 * @param {EventTarget} node
	 * @param {string} event
	 * @param {EventListenerOrEventListenerObject} handler
	 * @param {boolean | AddEventListenerOptions | EventListenerOptions} [options]
	 * @returns {() => void}
	 */
	function listen(node, event, handler, options) {
		node.addEventListener(event, handler, options);
		return () => node.removeEventListener(event, handler, options);
	}

	/**
	 * @returns {(event: any) => any} */
	function prevent_default(fn) {
		return function (event) {
			event.preventDefault();
			// @ts-ignore
			return fn.call(this, event);
		};
	}

	/**
	 * @param {Element} node
	 * @param {string} attribute
	 * @param {string} [value]
	 * @returns {void}
	 */
	function attr(node, attribute, value) {
		if (value == null) node.removeAttribute(attribute);
		else if (node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
	}

	/**
	 * @param {Element} element
	 * @returns {ChildNode[]}
	 */
	function children(element) {
		return Array.from(element.childNodes);
	}

	/**
	 * @returns {void} */
	function set_style(node, key, value, important) {
		if (value == null) {
			node.style.removeProperty(key);
		} else {
			node.style.setProperty(key, value, '');
		}
	}

	/**
	 * @returns {void} */
	function toggle_class(element, name, toggle) {
		// The `!!` is required because an `undefined` flag means flipping the current state.
		element.classList.toggle(name, !!toggle);
	}

	/**
	 * @template T
	 * @param {string} type
	 * @param {T} [detail]
	 * @param {{ bubbles?: boolean, cancelable?: boolean }} [options]
	 * @returns {CustomEvent<T>}
	 */
	function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
		return new CustomEvent(type, { detail, bubbles, cancelable });
	}

	/**
	 * @typedef {Node & {
	 * 	claim_order?: number;
	 * 	hydrate_init?: true;
	 * 	actual_end_child?: NodeEx;
	 * 	childNodes: NodeListOf<NodeEx>;
	 * }} NodeEx
	 */

	/** @typedef {ChildNode & NodeEx} ChildNodeEx */

	/** @typedef {NodeEx & { claim_order: number }} NodeEx2 */

	/**
	 * @typedef {ChildNodeEx[] & {
	 * 	claim_info?: {
	 * 		last_index: number;
	 * 		total_claimed: number;
	 * 	};
	 * }} ChildNodeArray
	 */

	// we need to store the information for multiple documents because a Svelte application could also contain iframes
	// https://github.com/sveltejs/svelte/issues/3624
	/** @type {Map<Document | ShadowRoot, import('./private.d.ts').StyleInformation>} */
	const managed_styles = new Map();

	let active = 0;

	// https://github.com/darkskyapp/string-hash/blob/master/index.js
	/**
	 * @param {string} str
	 * @returns {number}
	 */
	function hash(str) {
		let hash = 5381;
		let i = str.length;
		while (i--) hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
		return hash >>> 0;
	}

	/**
	 * @param {Document | ShadowRoot} doc
	 * @param {Element & ElementCSSInlineStyle} node
	 * @returns {{ stylesheet: any; rules: {}; }}
	 */
	function create_style_information(doc, node) {
		const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
		managed_styles.set(doc, info);
		return info;
	}

	/**
	 * @param {Element & ElementCSSInlineStyle} node
	 * @param {number} a
	 * @param {number} b
	 * @param {number} duration
	 * @param {number} delay
	 * @param {(t: number) => number} ease
	 * @param {(t: number, u: number) => string} fn
	 * @param {number} uid
	 * @returns {string}
	 */
	function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
		const step = 16.666 / duration;
		let keyframes = '{\n';
		for (let p = 0; p <= 1; p += step) {
			const t = a + (b - a) * ease(p);
			keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
		}
		const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
		const name = `__svelte_${hash(rule)}_${uid}`;
		const doc = get_root_for_style(node);
		const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
		if (!rules[name]) {
			rules[name] = true;
			stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
		}
		const animation = node.style.animation || '';
		node.style.animation = `${
		animation ? `${animation}, ` : ''
	}${name} ${duration}ms linear ${delay}ms 1 both`;
		active += 1;
		return name;
	}

	/**
	 * @param {Element & ElementCSSInlineStyle} node
	 * @param {string} [name]
	 * @returns {void}
	 */
	function delete_rule(node, name) {
		const previous = (node.style.animation || '').split(', ');
		const next = previous.filter(
			name
				? (anim) => anim.indexOf(name) < 0 // remove specific animation
				: (anim) => anim.indexOf('__svelte') === -1 // remove all Svelte animations
		);
		const deleted = previous.length - next.length;
		if (deleted) {
			node.style.animation = next.join(', ');
			active -= deleted;
			if (!active) clear_rules();
		}
	}

	/** @returns {void} */
	function clear_rules() {
		raf(() => {
			if (active) return;
			managed_styles.forEach((info) => {
				const { ownerNode } = info.stylesheet;
				// there is no ownerNode if it runs on jsdom.
				if (ownerNode) detach(ownerNode);
			});
			managed_styles.clear();
		});
	}

	let current_component;

	/** @returns {void} */
	function set_current_component(component) {
		current_component = component;
	}

	const dirty_components = [];
	const binding_callbacks = [];

	let render_callbacks = [];

	const flush_callbacks = [];

	const resolved_promise = /* @__PURE__ */ Promise.resolve();

	let update_scheduled = false;

	/** @returns {void} */
	function schedule_update() {
		if (!update_scheduled) {
			update_scheduled = true;
			resolved_promise.then(flush);
		}
	}

	/** @returns {void} */
	function add_render_callback(fn) {
		render_callbacks.push(fn);
	}

	// flush() calls callbacks in this order:
	// 1. All beforeUpdate callbacks, in order: parents before children
	// 2. All bind:this callbacks, in reverse order: children before parents.
	// 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
	//    for afterUpdates called during the initial onMount, which are called in
	//    reverse order: children before parents.
	// Since callbacks might update component values, which could trigger another
	// call to flush(), the following steps guard against this:
	// 1. During beforeUpdate, any updated components will be added to the
	//    dirty_components array and will cause a reentrant call to flush(). Because
	//    the flush index is kept outside the function, the reentrant call will pick
	//    up where the earlier call left off and go through all dirty components. The
	//    current_component value is saved and restored so that the reentrant call will
	//    not interfere with the "parent" flush() call.
	// 2. bind:this callbacks cannot trigger new flush() calls.
	// 3. During afterUpdate, any updated components will NOT have their afterUpdate
	//    callback called a second time; the seen_callbacks set, outside the flush()
	//    function, guarantees this behavior.
	const seen_callbacks = new Set();

	let flushidx = 0; // Do *not* move this inside the flush() function

	/** @returns {void} */
	function flush() {
		// Do not reenter flush while dirty components are updated, as this can
		// result in an infinite loop. Instead, let the inner flush handle it.
		// Reentrancy is ok afterwards for bindings etc.
		if (flushidx !== 0) {
			return;
		}
		const saved_component = current_component;
		do {
			// first, call beforeUpdate functions
			// and update components
			try {
				while (flushidx < dirty_components.length) {
					const component = dirty_components[flushidx];
					flushidx++;
					set_current_component(component);
					update(component.$$);
				}
			} catch (e) {
				// reset dirty state to not end up in a deadlocked state and then rethrow
				dirty_components.length = 0;
				flushidx = 0;
				throw e;
			}
			set_current_component(null);
			dirty_components.length = 0;
			flushidx = 0;
			while (binding_callbacks.length) binding_callbacks.pop()();
			// then, once components are updated, call
			// afterUpdate functions. This may cause
			// subsequent updates...
			for (let i = 0; i < render_callbacks.length; i += 1) {
				const callback = render_callbacks[i];
				if (!seen_callbacks.has(callback)) {
					// ...so guard against infinite loops
					seen_callbacks.add(callback);
					callback();
				}
			}
			render_callbacks.length = 0;
		} while (dirty_components.length);
		while (flush_callbacks.length) {
			flush_callbacks.pop()();
		}
		update_scheduled = false;
		seen_callbacks.clear();
		set_current_component(saved_component);
	}

	/** @returns {void} */
	function update($$) {
		if ($$.fragment !== null) {
			$$.update();
			run_all($$.before_update);
			const dirty = $$.dirty;
			$$.dirty = [-1];
			$$.fragment && $$.fragment.p($$.ctx, dirty);
			$$.after_update.forEach(add_render_callback);
		}
	}

	/**
	 * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
	 * @param {Function[]} fns
	 * @returns {void}
	 */
	function flush_render_callbacks(fns) {
		const filtered = [];
		const targets = [];
		render_callbacks.forEach((c) => (fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c)));
		targets.forEach((c) => c());
		render_callbacks = filtered;
	}

	/**
	 * @type {Promise<void> | null}
	 */
	let promise;

	/**
	 * @returns {Promise<void>}
	 */
	function wait() {
		if (!promise) {
			promise = Promise.resolve();
			promise.then(() => {
				promise = null;
			});
		}
		return promise;
	}

	/**
	 * @param {Element} node
	 * @param {INTRO | OUTRO | boolean} direction
	 * @param {'start' | 'end'} kind
	 * @returns {void}
	 */
	function dispatch(node, direction, kind) {
		node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
	}

	const outroing = new Set();

	/**
	 * @type {Outro}
	 */
	let outros;

	/**
	 * @returns {void} */
	function group_outros() {
		outros = {
			r: 0,
			c: [],
			p: outros // parent group
		};
	}

	/**
	 * @returns {void} */
	function check_outros() {
		if (!outros.r) {
			run_all(outros.c);
		}
		outros = outros.p;
	}

	/**
	 * @param {import('./private.js').Fragment} block
	 * @param {0 | 1} [local]
	 * @returns {void}
	 */
	function transition_in(block, local) {
		if (block && block.i) {
			outroing.delete(block);
			block.i(local);
		}
	}

	/**
	 * @param {import('./private.js').Fragment} block
	 * @param {0 | 1} local
	 * @param {0 | 1} [detach]
	 * @param {() => void} [callback]
	 * @returns {void}
	 */
	function transition_out(block, local, detach, callback) {
		if (block && block.o) {
			if (outroing.has(block)) return;
			outroing.add(block);
			outros.c.push(() => {
				outroing.delete(block);
				if (callback) {
					block.d(1);
					callback();
				}
			});
			block.o(local);
		} else if (callback) {
			callback();
		}
	}

	/**
	 * @type {import('../transition/public.js').TransitionConfig}
	 */
	const null_transition = { duration: 0 };

	/**
	 * @param {Element & ElementCSSInlineStyle} node
	 * @param {TransitionFn} fn
	 * @param {any} params
	 * @returns {{ start(): void; invalidate(): void; end(): void; }}
	 */
	function create_in_transition(node, fn, params) {
		/**
		 * @type {TransitionOptions} */
		const options = { direction: 'in' };
		let config = fn(node, params, options);
		let running = false;
		let animation_name;
		let task;
		let uid = 0;

		/**
		 * @returns {void} */
		function cleanup() {
			if (animation_name) delete_rule(node, animation_name);
		}

		/**
		 * @returns {void} */
		function go() {
			const {
				delay = 0,
				duration = 300,
				easing = identity,
				tick = noop,
				css
			} = config || null_transition;
			if (css) animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
			tick(0, 1);
			const start_time = now() + delay;
			const end_time = start_time + duration;
			if (task) task.abort();
			running = true;
			add_render_callback(() => dispatch(node, true, 'start'));
			task = loop((now) => {
				if (running) {
					if (now >= end_time) {
						tick(1, 0);
						dispatch(node, true, 'end');
						cleanup();
						return (running = false);
					}
					if (now >= start_time) {
						const t = easing((now - start_time) / duration);
						tick(t, 1 - t);
					}
				}
				return running;
			});
		}
		let started = false;
		return {
			start() {
				if (started) return;
				started = true;
				delete_rule(node);
				if (is_function(config)) {
					config = config(options);
					wait().then(go);
				} else {
					go();
				}
			},
			invalidate() {
				started = false;
			},
			end() {
				if (running) {
					cleanup();
					running = false;
				}
			}
		};
	}

	/**
	 * @param {Element & ElementCSSInlineStyle} node
	 * @param {TransitionFn} fn
	 * @param {any} params
	 * @returns {{ end(reset: any): void; }}
	 */
	function create_out_transition(node, fn, params) {
		/** @type {TransitionOptions} */
		const options = { direction: 'out' };
		let config = fn(node, params, options);
		let running = true;
		let animation_name;
		const group = outros;
		group.r += 1;
		/** @type {boolean} */
		let original_inert_value;

		/**
		 * @returns {void} */
		function go() {
			const {
				delay = 0,
				duration = 300,
				easing = identity,
				tick = noop,
				css
			} = config || null_transition;

			if (css) animation_name = create_rule(node, 1, 0, duration, delay, easing, css);

			const start_time = now() + delay;
			const end_time = start_time + duration;
			add_render_callback(() => dispatch(node, false, 'start'));

			if ('inert' in node) {
				original_inert_value = /** @type {HTMLElement} */ (node).inert;
				node.inert = true;
			}

			loop((now) => {
				if (running) {
					if (now >= end_time) {
						tick(0, 1);
						dispatch(node, false, 'end');
						if (!--group.r) {
							// this will result in `end()` being called,
							// so we don't need to clean up here
							run_all(group.c);
						}
						return false;
					}
					if (now >= start_time) {
						const t = easing((now - start_time) / duration);
						tick(1 - t, t);
					}
				}
				return running;
			});
		}

		if (is_function(config)) {
			wait().then(() => {
				// @ts-ignore
				config = config(options);
				go();
			});
		} else {
			go();
		}

		return {
			end(reset) {
				if (reset && 'inert' in node) {
					node.inert = original_inert_value;
				}
				if (reset && config.tick) {
					config.tick(1, 0);
				}
				if (running) {
					if (animation_name) delete_rule(node, animation_name);
					running = false;
				}
			}
		};
	}

	/** @typedef {1} INTRO */
	/** @typedef {0} OUTRO */
	/** @typedef {{ direction: 'in' | 'out' | 'both' }} TransitionOptions */
	/** @typedef {(node: Element, params: any, options: TransitionOptions) => import('../transition/public.js').TransitionConfig} TransitionFn */

	/**
	 * @typedef {Object} Outro
	 * @property {number} r
	 * @property {Function[]} c
	 * @property {Object} p
	 */

	/**
	 * @typedef {Object} PendingProgram
	 * @property {number} start
	 * @property {INTRO|OUTRO} b
	 * @property {Outro} [group]
	 */

	/**
	 * @typedef {Object} Program
	 * @property {number} a
	 * @property {INTRO|OUTRO} b
	 * @property {1|-1} d
	 * @property {number} duration
	 * @property {number} start
	 * @property {number} end
	 * @property {Outro} [group]
	 */

	/** @returns {void} */
	function mount_component(component, target, anchor) {
		const { fragment, after_update } = component.$$;
		fragment && fragment.m(target, anchor);
		// onMount happens before the initial afterUpdate
		add_render_callback(() => {
			const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
			// if the component was destroyed immediately
			// it will update the `$$.on_destroy` reference to `null`.
			// the destructured on_destroy may still reference to the old array
			if (component.$$.on_destroy) {
				component.$$.on_destroy.push(...new_on_destroy);
			} else {
				// Edge case - component was destroyed immediately,
				// most likely as a result of a binding initialising
				run_all(new_on_destroy);
			}
			component.$$.on_mount = [];
		});
		after_update.forEach(add_render_callback);
	}

	/** @returns {void} */
	function destroy_component(component, detaching) {
		const $$ = component.$$;
		if ($$.fragment !== null) {
			flush_render_callbacks($$.after_update);
			run_all($$.on_destroy);
			$$.fragment && $$.fragment.d(detaching);
			// TODO null out other refs, including component.$$ (but need to
			// preserve final state?)
			$$.on_destroy = $$.fragment = null;
			$$.ctx = [];
		}
	}

	/** @returns {void} */
	function make_dirty(component, i) {
		if (component.$$.dirty[0] === -1) {
			dirty_components.push(component);
			schedule_update();
			component.$$.dirty.fill(0);
		}
		component.$$.dirty[(i / 31) | 0] |= 1 << i % 31;
	}

	// TODO: Document the other params
	/**
	 * @param {SvelteComponent} component
	 * @param {import('./public.js').ComponentConstructorOptions} options
	 *
	 * @param {import('./utils.js')['not_equal']} not_equal Used to compare props and state values.
	 * @param {(target: Element | ShadowRoot) => void} [append_styles] Function that appends styles to the DOM when the component is first initialised.
	 * This will be the `add_css` function from the compiled component.
	 *
	 * @returns {void}
	 */
	function init(
		component,
		options,
		instance,
		create_fragment,
		not_equal,
		props,
		append_styles = null,
		dirty = [-1]
	) {
		const parent_component = current_component;
		set_current_component(component);
		/** @type {import('./private.js').T$$} */
		const $$ = (component.$$ = {
			fragment: null,
			ctx: [],
			// state
			props,
			update: noop,
			not_equal,
			bound: blank_object(),
			// lifecycle
			on_mount: [],
			on_destroy: [],
			on_disconnect: [],
			before_update: [],
			after_update: [],
			context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
			// everything else
			callbacks: blank_object(),
			dirty,
			skip_bound: false,
			root: options.target || parent_component.$$.root
		});
		append_styles && append_styles($$.root);
		let ready = false;
		$$.ctx = instance
			? instance(component, options.props || {}, (i, ret, ...rest) => {
					const value = rest.length ? rest[0] : ret;
					if ($$.ctx && not_equal($$.ctx[i], ($$.ctx[i] = value))) {
						if (!$$.skip_bound && $$.bound[i]) $$.bound[i](value);
						if (ready) make_dirty(component, i);
					}
					return ret;
			  })
			: [];
		$$.update();
		ready = true;
		run_all($$.before_update);
		// `false` as a special case of no DOM component
		$$.fragment = create_fragment ? create_fragment($$.ctx) : false;
		if (options.target) {
			if (options.hydrate) {
				// TODO: what is the correct type here?
				// @ts-expect-error
				const nodes = children(options.target);
				$$.fragment && $$.fragment.l(nodes);
				nodes.forEach(detach);
			} else {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				$$.fragment && $$.fragment.c();
			}
			if (options.intro) transition_in(component.$$.fragment);
			mount_component(component, options.target, options.anchor);
			flush();
		}
		set_current_component(parent_component);
	}

	/**
	 * Base class for Svelte components. Used when dev=false.
	 *
	 * @template {Record<string, any>} [Props=any]
	 * @template {Record<string, any>} [Events=any]
	 */
	class SvelteComponent {
		/**
		 * ### PRIVATE API
		 *
		 * Do not use, may change at any time
		 *
		 * @type {any}
		 */
		$$ = undefined;
		/**
		 * ### PRIVATE API
		 *
		 * Do not use, may change at any time
		 *
		 * @type {any}
		 */
		$$set = undefined;

		/** @returns {void} */
		$destroy() {
			destroy_component(this, 1);
			this.$destroy = noop;
		}

		/**
		 * @template {Extract<keyof Events, string>} K
		 * @param {K} type
		 * @param {((e: Events[K]) => void) | null | undefined} callback
		 * @returns {() => void}
		 */
		$on(type, callback) {
			if (!is_function(callback)) {
				return noop;
			}
			const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
			callbacks.push(callback);
			return () => {
				const index = callbacks.indexOf(callback);
				if (index !== -1) callbacks.splice(index, 1);
			};
		}

		/**
		 * @param {Partial<Props>} props
		 * @returns {void}
		 */
		$set(props) {
			if (this.$$set && !is_empty(props)) {
				this.$$.skip_bound = true;
				this.$$set(props);
				this.$$.skip_bound = false;
			}
		}
	}

	/**
	 * @typedef {Object} CustomElementPropDefinition
	 * @property {string} [attribute]
	 * @property {boolean} [reflect]
	 * @property {'String'|'Boolean'|'Number'|'Array'|'Object'} [type]
	 */

	// generated during release, do not modify

	const PUBLIC_VERSION = '4';

	if (typeof window !== 'undefined')
		// @ts-ignore
		(window.__svelte || (window.__svelte = { v: new Set() })).v.add(PUBLIC_VERSION);

	/*
	Adapted from https://github.com/mattdesl
	Distributed under MIT License https://github.com/mattdesl/eases/blob/master/LICENSE.md
	*/

	/**
	 * https://svelte.dev/docs/svelte-easing
	 * @param {number} t
	 * @returns {number}
	 */
	function cubicOut(t) {
		const f = t - 1.0;
		return f * f * f + 1.0;
	}

	/**
	 * Animates the opacity of an element from 0 to the current opacity for `in` transitions and from the current opacity to 0 for `out` transitions.
	 *
	 * https://svelte.dev/docs/svelte-transition#fade
	 * @param {Element} node
	 * @param {import('./public').FadeParams} [params]
	 * @returns {import('./public').TransitionConfig}
	 */
	function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
		const o = +getComputedStyle(node).opacity;
		return {
			delay,
			duration,
			easing,
			css: (t) => `opacity: ${t * o}`
		};
	}

	/**
	 * Animates the x and y positions and the opacity of an element. `in` transitions animate from the provided values, passed as parameters to the element's default values. `out` transitions animate from the element's default values to the provided values.
	 *
	 * https://svelte.dev/docs/svelte-transition#fly
	 * @param {Element} node
	 * @param {import('./public').FlyParams} [params]
	 * @returns {import('./public').TransitionConfig}
	 */
	function fly(
		node,
		{ delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}
	) {
		const style = getComputedStyle(node);
		const target_opacity = +style.opacity;
		const transform = style.transform === 'none' ? '' : style.transform;
		const od = target_opacity * (1 - opacity);
		const [xValue, xUnit] = split_css_unit(x);
		const [yValue, yUnit] = split_css_unit(y);
		return {
			delay,
			duration,
			easing,
			css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * xValue}${xUnit}, ${(1 - t) * yValue}${yUnit});
			opacity: ${target_opacity - od * u}`
		};
	}

	// Objekt zum Speichern der ursprünglichen Schriftarten
	const originalFonts = new WeakMap();

	// Funktion, um die Font-Family der Textelemente zu speichern
	function saveFontFamilies() {
	    // Alle Textelemente auf der Seite holen
	    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, a');

	    // Durch alle Textelemente iterieren und die Font-Family speichern
	    textElements.forEach(element => {
	        const computedStyle = window.getComputedStyle(element);
	        const fontFamily = computedStyle.fontFamily;

	        // Speichere die ursprüngliche Schriftart, falls noch nicht gespeichert
	        if (!originalFonts.has(element)) {
	            originalFonts.set(element, fontFamily);
	        }
	    });
	}

	// Funktion, um Schriftart eines Elements zu ersetzen
	function replaceFont(element, newFont) {
	    element.style.fontFamily = newFont;
	}

	// Funktion, um die ursprüngliche Schriftart wiederherzustellen
	function restoreOriginalFont(element) {
	    if (originalFonts.has(element)) {
	        const originalFont = originalFonts.get(element);
	        element.style.fontFamily = originalFont;
	    }
	}

	// Funktion, um alle Textelemente auf der Seite zu durchsuchen und die Schriftarten zu ersetzen oder wiederherzustellen
	function replaceNonSansSerifFonts(shouldReplace) {
	    // Zuerst die ursprünglichen Font-Families speichern
	    saveFontFamilies();

	    // Alle Textelemente auf der Seite holen
	    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, a');

	    // Durch alle Textelemente iterieren
	    textElements.forEach(element => {
	        if (shouldReplace) {
	            // Aktuelle Schriftart des Elements holen
	            const currentFont = window.getComputedStyle(element).fontFamily;

	            // Prüfen, ob es sich um eine Serifen-Schriftart handelt
	            if (currentFont.includes('serif')) {
	                // Schriftart durch Helvetica oder Arial ersetzen
	                replaceFont(element, 'Helvetica, Arial, sans-serif');
	            }
	        } else {
	            // Schriftart auf den ursprünglichen Wert zurücksetzen
	            restoreOriginalFont(element);
	        }
	    });
	}

	function highlightHeadings(applyBorder) {
	    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');

	    headings.forEach(heading => {
	        // Überprüfe, ob das Heading ein Kind eines Elements mit der Klasse 'accessi_widget' ist
	        if (!heading.closest('.accessi_widget')) {
	            if (applyBorder) {
	                // Füge eine 3px schwarze Umrandung hinzu, wenn applyBorder true ist
	                heading.style.border = '3px solid var(--brand-blue)';
	                heading.style.padding = '10px';  
	            } else {
	                // Entferne die Umrandung, falls vorhanden (zur Sicherheit)
	                heading.style.border = 'none';
	            }
	        }
	    });
	}

	function highlightLinkButtons(applyBorder) {
	    // Wähle alle <a>- und <button>-Elemente auf der gesamten Seite aus
	    const allLinks = document.querySelectorAll('a');
	    const allButtons = document.querySelectorAll('button');
	    const combinedList = [...allLinks, ...allButtons];

	    combinedList.forEach(element => {
	        // Variable, um festzustellen, ob das Element innerhalb eines Elements mit dem Attribut data-accessi-none liegt
	        let isInsideAccessiNone = false;
	        let currentElement = element;

	        // Gehe die Eltern-Elemente durch, bis der Dokumentenkörper erreicht ist
	        while (currentElement) {
	            if (currentElement.hasAttribute('data-accessi-none')) {
	                isInsideAccessiNone = true;
	                break;
	            }
	            currentElement = currentElement.parentElement;
	        }

	        if (!isInsideAccessiNone) {
	            if (applyBorder) {
	                // Füge eine 3px Umrandung und 10px Padding hinzu, wenn applyBorder true ist
	                element.style.border = '3px solid var(--brand-blue)';
	                //element.style.margin = '10px';  
	            } else {
	                // Entferne die Umrandung und das Padding, falls vorhanden (zur Sicherheit)
	                element.style.border = 'none';
	                //element.style.padding = '';  // Entferne das Padding
	            }
	        }
	    });
	}

	function hasAncestorWithAttribute(element, attribute) {
	  // Überprüfen, ob das aktuelle Element das Attribut besitzt
	  if (element.hasAttribute(attribute)) {
	      return true;
	  }

	  // Durch die Elternkette des Elements iterieren
	  while (element.parentElement) {
	      element = element.parentElement;
	      if (element.hasAttribute(attribute)) {
	          return true;
	      }
	  }
	  // Wenn weder das Element noch seine Vorfahren das Attribut besitzen, gib false zurück
	  return false;
	}

	let originalFontSizes = new Map();

	function adjustFontSize(zoomFactor) {
	  // Holen Sie sich alle Elemente auf der Seite
	  const elements = document.body.getElementsByTagName("*");

	  // Speichern Sie die ursprünglichen Schriftgrößen, wenn es das erste Mal ist
	  if (originalFontSizes.size === 0) {
	    for (let i = 0; i < elements.length; i++) {
	      const element = elements[i];
	      originalFontSizes.set(element, parseFloat(getComputedStyle(element).fontSize));
	    }
	  }

	  // Durchlaufen Sie die Elemente und ändern Sie die Schriftgröße
	  for (let i = 0; i < elements.length; i++) {
	    const element = elements[i];

	    // Überprüfen Sie, ob das Element oder eines seiner übergeordneten Elemente das Attribut "data-accessi-none" hat
	    if (hasAncestorWithAttribute(element, "data-accessi-none")) {
	      // Überspringen Sie das Element und alle seine Kindelemente, wenn eines seiner übergeordneten Elemente das Attribut hat
	      continue;
	    } else {
	      // Holen Sie die ursprüngliche Schriftgröße des Elements
	      const originalFontSize = originalFontSizes.get(element);

	      // Berechnen Sie die neue Schriftgröße basierend auf dem extrahierten Zoom-Faktor
	      const newFontSize = originalFontSize * parseFloat(zoomFactor);

	      // Setzen Sie die neue Schriftgröße für das Element
	      element.style.fontSize = `${newFontSize}px`;
	    }
	  }
	}

	let currentAlignment = "none";
	const originalTextAlignments = new Map(); // Map zum Speichern der ursprünglichen Textausrichtungen

	function adjustTextAlignment(alignment) {
	  if (currentAlignment === alignment) {
	    restoreOldTextAlignment();
	    return;
	  }

	  // Holen Sie sich alle Elemente auf der Seite
	  const elements = document.body.getElementsByTagName("*");

	  // Durchlaufen Sie alle Elemente und setzen Sie die Textausrichtung je nach Attribut
	  for (let i = 0; i < elements.length; i++) {
	    const element = elements[i];

	    // Überprüfen Sie, ob das Element selbst das Attribut "data-accessi-none" hat
	    if (!hasAncestorWithAttribute(element, "data-accessi-none")) {
	      
	      // Speichern Sie den ursprünglichen textAlign-Wert, falls noch nicht gespeichert
	      if (!originalTextAlignments.has(element)) {
	        originalTextAlignments.set(element, element.style.textAlign);
	      }

	      // Setzen Sie die Textausrichtung basierend auf dem übergebenen Wert
	      switch (alignment) {
	        case "left":
	          element.style.textAlign = "left";
	          currentAlignment = "left";
	          break;
	        case "center":
	          element.style.textAlign = "center";
	          currentAlignment = "center";
	          break;
	        case "right":
	          element.style.textAlign = "right";
	          currentAlignment = "right";
	          break;
	      }
	    }
	  }
	}

	function restoreOldTextAlignment() {
	  // Wiederherstellung der ursprünglichen Textausrichtungen
	  originalTextAlignments.forEach((originalAlignment, element) => {
	    element.style.textAlign = originalAlignment;
	  });

	  // Map leeren, da die ursprünglichen Werte wiederhergestellt wurden
	  originalTextAlignments.clear();

	  // Reset der aktuellen Ausrichtung
	  currentAlignment = "none";
	}

	let originalLineHeights = new Map();

	function adjustLineHeight(zoomFactor) {
	  // Holen Sie sich alle Elemente auf der Seite
	  const elements = document.body.getElementsByTagName("*");

	  // Speichern Sie die ursprünglichen Schriftgrößen, wenn es das erste Mal ist
	  if (originalLineHeights.size === 0) {
	    for (let i = 0; i < elements.length; i++) {
	      const element = elements[i];
	      originalLineHeights.set(element, parseFloat(getComputedStyle(element).lineHeight));
	    }
	  }

	  // Durchlaufen Sie die Elemente und ändern Sie die Schriftgröße
	  for (let i = 0; i < elements.length; i++) {
	    const element = elements[i];

	    // Überprüfen Sie, ob das Element oder eines seiner übergeordneten Elemente das Attribut "data-accessi-none" hat
	    if (hasAncestorWithAttribute(element, "data-accessi-none")) {
	      // Überspringen Sie das Element und alle seine Kindelemente, wenn eines seiner übergeordneten Elemente das Attribut hat
	      continue;
	    } else {
	      // Holen Sie die ursprüngliche Schriftgröße des Elements
	      const originalLineHeight = originalLineHeights.get(element);

	      // Berechnen Sie die neue Schriftgröße basierend auf dem extrahierten Zoom-Faktor
	      const newLineHeight = originalLineHeight * parseFloat(zoomFactor);

	      // Setzen Sie die neue Schriftgröße für das Element
	      element.style.lineHeight = `${newLineHeight}px`;
	    }
	  }
	}

	let originalLetterSpacings = new Map();
	function adjustLetterSpacing(zoomFactor) {
	  const elements = document.body.getElementsByTagName("*");
	  
	  // Normalisieren des zoomFaktors
	  zoomFactor = zoomFactor.toString().toLowerCase().replace('x', '');
	  zoomFactor = parseFloat(zoomFactor);

	  if (originalLetterSpacings.size === 0) {
	    for (let element of elements) {
	      const computedStyle = getComputedStyle(element);
	      const computedLetterSpacing = computedStyle.letterSpacing;
	      
	      let originalSpacing;
	      if (computedLetterSpacing === "normal") {
	        originalSpacing = "normal";
	      } else {
	        originalSpacing = computedLetterSpacing;
	      }
	      
	      originalLetterSpacings.set(element, originalSpacing);
	    }
	  }

	  for (let element of elements) {
	    if (!hasAncestorWithAttribute(element, "data-accessi-none")) {
	      const originalLetterSpacing = originalLetterSpacings.get(element);
	      
	      if (zoomFactor === 1) {
	        // Zurücksetzen auf den Originalwert
	        element.style.letterSpacing = originalLetterSpacing;
	      } else {
	        let newLetterSpacing;
	        if (originalLetterSpacing === "normal") {
	          // Verwenden Sie einen kleinen Standardwert für "normal" (z.B. 0.05em)
	          newLetterSpacing = 1.5 * zoomFactor;
	        } else {
	          newLetterSpacing = parseFloat(originalLetterSpacing) * zoomFactor;
	        }
	        
	        element.style.letterSpacing = `${newLetterSpacing}px`;
	      }
	    }
	  }
	}

	function invertColors(shouldInvert) {
	    const css = shouldInvert
	      ? 'html {-webkit-filter: invert(100%); -moz-filter: invert(100%); -o-filter: invert(100%); -ms-filter: invert(100%); }'
	      : 'html {-webkit-filter: invert(0%); -moz-filter: invert(0%); -o-filter: invert(0%); -ms-filter: invert(0%); }';
	  
	    const head = document.getElementsByTagName('head')[0];
	    const style = document.createElement('style');
	  
	    style.type = 'text/css';
	    if (style.styleSheet) {
	      style.styleSheet.cssText = css;
	    } else {
	      style.appendChild(document.createTextNode(css));
	    }
	  
	    // Entfernen des vorherigen Stils, falls vorhanden
	    const existingStyle = document.getElementById('invert-colors-style');
	    if (existingStyle) {
	      existingStyle.remove();
	    }
	  
	    // Hinzufügen einer ID zum neuen Stil-Element
	    style.id = 'invert-colors-style';
	    head.appendChild(style);
	  }

	// Speichere die ursprünglichen Farben
	let originalStyles$2 = new WeakMap();

	function saveOriginalStyles$3(element) {
	    const computedStyle = window.getComputedStyle(element);
	    originalStyles$2.set(element, {
	        backgroundColor: computedStyle.backgroundColor,
	        color: computedStyle.color
	    });
	}

	function restoreOriginalStyles$3(element) {
	    const styles = originalStyles$2.get(element);
	    if (styles) {
	        element.style.backgroundColor = styles.backgroundColor;
	        element.style.color = styles.color;
	    }
	}

	function isDescendantOfElementWithAttribute$1(element, attributeName) {
	    while (element) {
	        if (element.hasAttribute && element.hasAttribute(attributeName)) {
	            return true;
	        }
	        element = element.parentElement;
	    }
	    return false;
	}

	function darkContract(isDarkMode) {
	    if (isDarkMode) {
	        // Speicher die ursprünglichen Farben nur für Elemente, die kein Elternelement mit data-accessi-none haben
	        document.querySelectorAll('*').forEach(element => {
	            if (!isDescendantOfElementWithAttribute$1(element, 'data-accessi-none')) {
	                saveOriginalStyles$3(element);
	            }
	        });

	        // Setze alle Hintergrundfarben auf Weiß und Textfarbe auf Schwarz
	        document.querySelectorAll('*').forEach(element => {
	            if (!isDescendantOfElementWithAttribute$1(element, 'data-accessi-none')) {
	                const bgColor = window.getComputedStyle(element).backgroundColor;
	                if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
	                    element.style.backgroundColor = '#000000'; // Weiß
	                }
	                element.style.color = '#FFFFFF'; // Schwarz
	            }
	        });
	    } else {
	        // Stelle das ursprüngliche Styling nur für Elemente wieder her, die kein Elternelement mit data-accessi-none haben
	        document.querySelectorAll('*').forEach(element => {
	            if (!isDescendantOfElementWithAttribute$1(element, 'data-accessi-none')) {
	                restoreOriginalStyles$3(element);
	            }
	        });
	    }
	}

	// Speichere die ursprünglichen Farben
	let originalStyles$1 = new WeakMap();

	function saveOriginalStyles$2(element) {
	    const computedStyle = window.getComputedStyle(element);
	    originalStyles$1.set(element, {
	        backgroundColor: computedStyle.backgroundColor,
	        color: computedStyle.color
	    });
	}

	function restoreOriginalStyles$2(element) {
	    const styles = originalStyles$1.get(element);
	    if (styles) {
	        element.style.backgroundColor = styles.backgroundColor;
	        element.style.color = styles.color;
	    }
	}

	function isDescendantOfElementWithAttribute(element, attributeName) {
	    while (element) {
	        if (element.hasAttribute && element.hasAttribute(attributeName)) {
	            return true;
	        }
	        element = element.parentElement;
	    }
	    return false;
	}

	function lightContrast(isLightMode) {
	    if (isLightMode) {
	        // Speicher die ursprünglichen Farben nur für Elemente, die kein Elternelement mit data-accessi-none haben
	        document.querySelectorAll('*').forEach(element => {
	            if (!isDescendantOfElementWithAttribute(element, 'data-accessi-none')) {
	                saveOriginalStyles$2(element);
	            }
	        });

	        // Setze alle Hintergrundfarben auf Weiß und Textfarbe auf Schwarz
	        document.querySelectorAll('*').forEach(element => {
	            if (!isDescendantOfElementWithAttribute(element, 'data-accessi-none')) {
	                const bgColor = window.getComputedStyle(element).backgroundColor;
	                if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
	                    element.style.backgroundColor = '#FFFFFF'; // Weiß
	                }
	                element.style.color = '#000000'; // Schwarz
	            }
	        });
	    } else {
	        // Stelle das ursprüngliche Styling nur für Elemente wieder her, die kein Elternelement mit data-accessi-none haben
	        document.querySelectorAll('*').forEach(element => {
	            if (!isDescendantOfElementWithAttribute(element, 'data-accessi-none')) {
	                restoreOriginalStyles$2(element);
	            }
	        });
	    }
	}

	// WeakMap, um die ursprünglichen Stile zu speichern
	let originalStyles = new WeakMap();

	// Funktion, um die ursprünglichen Stile zu speichern
	function saveOriginalStyles$1(element) {
	    if (!originalStyles.has(element)) {
	        const computedStyle = window.getComputedStyle(element);
	        originalStyles.set(element, {
	            backgroundColor: computedStyle.backgroundColor,
	            color: computedStyle.color
	        });
	    }
	}

	// Funktion, um die ursprünglichen Stile wiederherzustellen
	function restoreOriginalStyles$1(element) {
	    const styles = originalStyles.get(element);
	    if (styles) {
	        element.style.backgroundColor = styles.backgroundColor;
	        element.style.color = styles.color;
	    }
	}

	// Konvertiert RGB in HSL
	function rgbToHsl(r, g, b) {
	    r /= 255, g /= 255, b /= 255;
	    const max = Math.max(r, g, b), min = Math.min(r, g, b);
	    let h, s, l = (max + min) / 2;

	    if (max === min) {
	        h = s = 0; // achromatisch
	    } else {
	        const d = max - min;
	        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
	        switch (max) {
	            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
	            case g: h = (b - r) / d + 2; break;
	            case b: h = (r - g) / d + 4; break;
	        }
	        h /= 6;
	    }
	    return [h * 360, s * 100, l * 100]; // HSL Werte in Prozent zurückgeben
	}

	// Konvertiert HSL in RGB
	function hslToRgb(h, s, l) {
	    h /= 360, s /= 100, l /= 100;
	    let r, g, b;
	    if (s === 0) {
	        r = g = b = l; // achromatisch
	    } else {
	        const hue2rgb = (p, q, t) => {
	            if (t < 0) t += 1;
	            if (t > 1) t -= 1;
	            if (t < 1 / 6) return p + (q - p) * 6 * t;
	            if (t < 1 / 2) return q;
	            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
	            return p;
	        };
	        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
	        const p = 2 * l - q;
	        r = hue2rgb(p, q, h + 1 / 3);
	        g = hue2rgb(p, q, h);
	        b = hue2rgb(p, q, h - 1 / 3);
	    }
	    return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
	}

	// Überprüft, ob eine Farbe farbig ist (keine Grautöne, Schwarz oder Weiß)
	function isColorful(color) {
	    const rgb = color.match(/\d+/g).map(Number);
	    const [h, s, l] = rgbToHsl(rgb[0], rgb[1], rgb[2]);
	    return !(s === 0 && (l === 100 || l === 0)); // Nicht Weiß oder Schwarz
	}

	// Erhöht die Sättigung stark
	function saturateColor(color, saturationIncrease = 50) {
	    const rgb = color.match(/\d+/g).map(Number);
	    let [h, s, l] = rgbToHsl(rgb[0], rgb[1], rgb[2]);
	    s = Math.min(100, s + saturationIncrease); // Sättigung auf maximal 100% erhöhen
	    return hslToRgb(h, s, l);
	}

	// Verringert die Sättigung stark
	function desaturateColor(color, saturationDecrease = 50) {
	    const rgb = color.match(/\d+/g).map(Number);
	    let [h, s, l] = rgbToHsl(rgb[0], rgb[1], rgb[2]);
	    s = Math.max(0, s - saturationDecrease); // Sättigung auf minimal 0% verringern
	    return hslToRgb(h, s, l);
	}

	// Hauptfunktion zur Anwendung der Sättigungsänderungen
	function applySaturation(mode) {
	    document.querySelectorAll('*').forEach(element => {
	        // Überspringe Elemente, die das Attribut "data-accessi-none" haben oder einen Vorfahren mit diesem Attribut haben
	        if (!element.hasAttribute("data-accessi-none") && !hasAncestorWithAttribute(element, "data-accessi-none")) {
	            const bgColor = window.getComputedStyle(element).backgroundColor;
	            const textColor = window.getComputedStyle(element).color;

	            if (mode === 'none') {
	                // Stile zurücksetzen
	                restoreOriginalStyles$1(element);
	            } else if (isColorful(bgColor) || isColorful(textColor)) {
	                // Ursprüngliche Stile speichern
	                saveOriginalStyles$1(element);

	                // Sättigung anpassen
	                if (mode === 'high') {
	                    if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
	                        element.style.backgroundColor = saturateColor(bgColor);
	                    }
	                    if (textColor) {
	                        element.style.color = saturateColor(textColor, 30); // Text auch stärker sättigen
	                    }
	                } else if (mode === 'low') {
	                    if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
	                        element.style.backgroundColor = desaturateColor(bgColor);
	                    }
	                    if (textColor) {
	                        element.style.color = desaturateColor(textColor, 30); // Text weniger stark entsättigen
	                    }
	                }
	            }
	        }
	    });
	}

	// Beispielaufrufe
	// applySaturation('high');  // Sättigung stark erhöhen
	// applySaturation('low');   // Sättigung verringern
	// applySaturation('none');  // Ursprüngliche Sättigung wiederherstellen

	let originalBackgroundColor$1 = new Map();

	function applyBackgroundColor(color) {
	  const elements = document.body.getElementsByTagName("*");

	  // Bevor wir die Hintergrundfarbe ändern, stellen wir sicher, dass die Sättigung auf "none" gesetzt wird
	  applySaturation('none'); // Setze die Sättigung auf "none", um Überschneidungen zu vermeiden

	  if (originalBackgroundColor$1.size === 0) {
	    for (let i = 0; i < elements.length; i++) {
	      const element = elements[i];
	      originalBackgroundColor$1.set(element, getComputedStyle(element).backgroundColor);
	    }
	  }

	  for (let i = 0; i < elements.length; i++) {
	    const element = elements[i];

	    if (hasAncestorWithAttribute(element, "data-accessi-none")) {
	      continue;
	    } else {
	      if (color === "none") {
	        // Setze die ursprüngliche Hintergrundfarbe wiederher
	        element.style.backgroundColor = originalBackgroundColor$1.get(element);
	      } else {
	        element.style.backgroundColor = `${color}`;
	      }
	    }
	  }

	  // Falls color "none" ist, leere die Map, da die ursprünglichen Werte wiederhergestellt wurden
	  if (color === "none") {
	    originalBackgroundColor$1.clear();
	  }
	}

	let originalHeadingColor = new Map();

	function applyHeadingColor(color) {
	  const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');

	  if (originalHeadingColor.size === 0) {
	    for (let i = 0; i < elements.length; i++) {
	      const element = elements[i];
	      originalHeadingColor.set(element, getComputedStyle(element).color);
	    }
	  }

	  for (let i = 0; i < elements.length; i++) {
	    const element = elements[i];

	    if (hasAncestorWithAttribute(element, "data-accessi-none")) {
	      continue;
	    } else {
	      if (color === "none") {
	        // Setze die ursprüngliche Farbe wiederher
	        element.style.color = originalHeadingColor.get(element);
	      } else {
	        element.style.color = `${color}`;
	      }
	    }
	  }

	  // Falls color "none" ist, leere die Map, da die ursprünglichen Werte wiederhergestellt wurden
	  if (color === "none") {
	    originalHeadingColor.clear();
	  }
	}

	let originalTextColor = new Map();

	function applyTextColor(color) {
	  const elements = document.querySelectorAll('p, span, div');

	  if (originalTextColor.size === 0) {
	    for (let i = 0; i < elements.length; i++) {
	      const element = elements[i];
	      originalTextColor.set(element, getComputedStyle(element).color);
	    }
	  }

	  for (let i = 0; i < elements.length; i++) {
	    const element = elements[i];

	    if (hasAncestorWithAttribute(element, "data-accessi-none")) {
	      continue;
	    } else {
	      if (color === "none") {
	        // Setze die ursprüngliche Farbe wiederher
	        element.style.color = originalTextColor.get(element);
	      } else {
	        element.style.color = `${color}`;
	      }
	    }
	  }

	  // Falls color "none" ist, leere die Map, da die ursprünglichen Werte wiederhergestellt wurden
	  if (color === "none") {
	    originalTextColor.clear();
	  }
	}

	let originalLinkColor = new Map();

	function applyLinkColor(color) {
	  const elements = document.querySelectorAll('a, button');

	  if (originalLinkColor.size === 0) {
	    for (let i = 0; i < elements.length; i++) {
	      const element = elements[i];
	      originalLinkColor.set(element, getComputedStyle(element).color);
	    }
	  }

	  for (let i = 0; i < elements.length; i++) {
	    const element = elements[i];

	    if (hasAncestorWithAttribute(element, "data-accessi-none")) {
	      continue;
	    } else {
	      if (color === "none") {
	        // Setze die ursprüngliche Farbe wiederher
	        element.style.color = originalLinkColor.get(element);
	      } else {
	        element.style.color = `${color}`;
	      }
	    }
	  }

	  // Falls color "none" ist, leere die Map, da die ursprünglichen Werte wiederhergestellt wurden
	  if (color === "none") {
	    originalLinkColor.clear();
	  }
	}

	let originalBackgroundColor = new Map();

	function applyHideImages(hide) {
	  const elements = document.body.getElementsByTagName("img");

	  if (originalBackgroundColor.size === 0) {
	    for (let i = 0; i < elements.length; i++) {
	      const element = elements[i];
	      originalBackgroundColor.set(element, getComputedStyle(element).opacity);
	    }
	  }

	  for (let i = 0; i < elements.length; i++) {
	    const element = elements[i];

	    if (hasAncestorWithAttribute(element, "data-accessi-none")) {
	      continue;
	    }

	    if (hide) {
	      element.style.opacity = 0;
	      element.style.visibility = 'hidden';
	    } else {
	      element.style.opacity = originalBackgroundColor.get(element);
	      element.style.visibility = 'visible';
	    }
	  }
	}

	let originalVideoVisibility = new Map();

	function applyHideVideos(hide) {
	  const videoFormats = ['.mp4', '.mov', '.webm', '.ogg'];
	  const elements = document.querySelectorAll('[src], video');

	  if (originalVideoVisibility.size === 0) {
	    for (let i = 0; i < elements.length; i++) {
	      const element = elements[i];
	      const src = element.getAttribute('src');
	      
	      if (isVideoElement(element) || isVideoSource(src, videoFormats)) {
	        originalVideoVisibility.set(element, {
	          opacity: getComputedStyle(element).opacity,
	          visibility: getComputedStyle(element).visibility
	        });
	      }
	    }
	  }

	  originalVideoVisibility.forEach((style, element) => {
	    if (hasAncestorWithAttribute(element, "data-accessi-none")) {
	      return;
	    }

	    if (hide) {
	      element.style.opacity = 0;
	      element.style.visibility = 'hidden';
	    } else {
	      element.style.opacity = style.opacity;
	      element.style.visibility = style.visibility;
	    }
	  });

	  if (!hide) {
	    originalVideoVisibility.clear();
	  }
	}

	function isVideoSource(src, formats) {
	  return src && formats.some(format => src.endsWith(format));
	}

	function isVideoElement(element) {
	  return element.tagName.toLowerCase() === 'video';
	}

	// Map zum Speichern der ursprünglichen CSS-Eigenschaften
	const originalStylesMap = new Map();

	// Arrays zum Speichern von setInterval- und requestAnimationFrame-IDs
	let intervalIDs = [];
	let animationFrameIDs = [];

	// Funktion zum Speichern der ursprünglichen CSS-Eigenschaften
	function saveOriginalStyles(element) {
	    const computedStyle = window.getComputedStyle(element);
	    
	    originalStylesMap.set(element, {
	        animationPlayState: computedStyle.animationPlayState,
	        transition: computedStyle.transition,
	        transitionDuration: computedStyle.transitionDuration
	    });
	}

	// Funktion zum Wiederherstellen der ursprünglichen CSS-Eigenschaften
	function restoreOriginalStyles() {
	    originalStylesMap.forEach((styles, element) => {
	        element.style.animationPlayState = styles.animationPlayState || '';
	        element.style.transition = styles.transition || '';
	    });
	}

	// Funktion zum Stoppen aller CSS-Animationen und Übergänge
	function stopCSSAnimations() {
	    document.querySelectorAll('*').forEach(function(element) {
	        const computedStyle = window.getComputedStyle(element);

	        // Speichert die ursprünglichen Stile, wenn sie noch nicht gespeichert wurden
	        if (!originalStylesMap.has(element)) {
	            saveOriginalStyles(element);
	        }

	        // Stoppt CSS-Animationen
	        if (computedStyle.animationName !== 'none') {
	            element.style.animationPlayState = 'paused';
	        }

	        // Stoppt CSS-Übergänge
	        if (computedStyle.transitionDuration !== '0s') {
	            element.style.transition = 'none';
	        }
	    });
	}

	// Funktion zum Stoppen von JavaScript-basierten Animationen (Slider und ähnliche)
	function stopJavaScriptAnimations() {
	    // Pausiere, anstatt Intervalle zu löschen, speichere IDs
	    intervalIDs.forEach(id => clearInterval(id));
	    intervalIDs = [];

	    animationFrameIDs.forEach(id => cancelAnimationFrame(id));
	    animationFrameIDs = [];
	}

	// Funktion zum Wiederherstellen von JavaScript-basierten Animationen
	function restoreJavaScriptAnimations() {
	    // Hier kannst du deine JavaScript-Animationen manuell neu starten
	    // Falls sie mit setInterval oder requestAnimationFrame erstellt wurden, musst du sie hier neu initiieren.
	    intervalIDs.forEach(id => clearInterval(id)); // Keine Wiederherstellung möglich
	    animationFrameIDs.forEach(id => cancelAnimationFrame(id)); // Keine Wiederherstellung möglich
	}

	// Funktion zum Pausieren aller Videos
	function pauseAllVideos() {
	    document.querySelectorAll('video').forEach(function(video) {
	        video.pause(); // Pausiere alle laufenden Videos
	    });
	}

	// Funktion zum Wiederherstellen aller Videos
	function restoreAllVideos() {
	    document.querySelectorAll('video').forEach(function(video) {
	        if (video.paused) {
	            video.play().catch(error => {
	                console.log("Video konnte nicht abgespielt werden:", error);
	            });
	        }
	    });
	}

	// Funktion zum Stoppen von GIFs (durch Ersetzen mit einem statischen Bild)
	function stopGIFAnimations() {
	    document.querySelectorAll('img').forEach(function(img) {
	        if (img.src.endsWith('.gif')) {
	            let staticSrc = img.src; // Hier könntest du einen Ersatz für das GIF-Bild bereitstellen
	            img.src = staticSrc; // Das GIF durch das statische Bild ersetzen
	        }
	    });
	}

	// Alles zusammenführen in eine Funktion
	function applyHideAnimations(shouldStop) {
	    if (shouldStop) {
	        stopCSSAnimations();
	        stopJavaScriptAnimations(); // Pausiere JS-Animationen
	        pauseAllVideos();
	        stopGIFAnimations();
	    } else {
	        restoreOriginalStyles(); // Stile wiederherstellen
	        restoreJavaScriptAnimations(); // JavaScript-Animationen manuell wieder starten
	        restoreAllVideos(); // Videos wieder abspielen
	    }
	}

	// Optional: Überwachung von neuen DOM-Änderungen (MutationObserver), um dynamische Inhalte zu stoppen oder wiederherzustellen
	var observer = new MutationObserver(function(mutationsList) {
	    mutationsList.forEach(function(mutation) {
	        mutation.addedNodes.forEach(function(node) {
	            if (node.nodeType === 1) { // Überprüfen, ob es sich um ein Element handelt
	                // Animationen anhalten oder Übergänge stoppen
	                if (window.getComputedStyle(node).animationName !== 'none') {
	                    if (!originalStylesMap.has(node)) {
	                        saveOriginalStyles(node);
	                    }
	                    node.style.animationPlayState = 'paused';
	                }
	                if (window.getComputedStyle(node).transitionDuration !== '0s') {
	                    node.style.transition = 'none';
	                }
	                // Videos pausieren
	                if (node.tagName === 'VIDEO') {
	                    node.pause();
	                }
	                // GIFs stoppen
	                if (node.tagName === 'IMG' && node.src.endsWith('.gif')) {
	                    let staticSrc = node.src;
	                    node.src = staticSrc;
	                }
	            }
	        });
	    });
	});

	observer.observe(document.body, { childList: true, subtree: true });

	function toggleAudio(disable) {
	  const audioElements = document.querySelectorAll('audio');

	  audioElements.forEach(audio => {
	    if (disable) {
	      audio.pause();
	      audio.muted = true;
	    } else {
	      audio.muted = false;
	      audio.play();
	    }
	  });
	}

	let cursorSize = 40;
	let cursorInnnerColor = "#FFFFFF";
	let cursorOuterColor = "#000000";

	function addCursor() {
	  const style = document.createElement('style');
	  style.textContent = `
    .accessi_mouse-overlay {
      position: fixed;
      left: 0;
      top: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 100000000000000;
    }
    .accessi_mouse-overlay svg {
      pointer-events: none;
    }
  `;
	  document.head.appendChild(style);

	  // Erstelle das SVG-Element für den Cursor
	  const cursorDiv = document.createElement('div');
	  cursorDiv.classList.add('accessi_mouse-overlay');
	  cursorDiv.innerHTML = `
    <svg id="customCursorSVG" width="${cursorSize}" height="${cursorSize}" viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path id="inner-cursor-color-accessi" d="M181.66 169L169 181.66C167.5 183.159 165.466 184.001 163.345 184.001C161.224 184.001 159.19 183.159 157.69 181.66L106.38 130.35C105.459 129.426 104.325 128.742 103.079 128.357C101.833 127.972 100.511 127.897 99.229 128.14C97.9471 128.382 96.7441 128.935 95.7246 129.749C94.7051 130.563 93.9002 131.614 93.38 132.81L75.56 179.22C74.8977 180.678 73.813 181.904 72.4463 182.739C71.0796 183.573 69.4938 183.979 67.8942 183.902C66.2945 183.826 64.7546 183.271 63.4738 182.31C62.193 181.348 61.2302 180.025 60.71 178.51L8.41 18.44C7.982 17.05 7.94102 15.5697 8.29146 14.1581C8.6419 12.7466 9.37049 11.4573 10.3989 10.4289C11.4273 9.4005 12.7166 8.6719 14.1281 8.32146C15.5397 7.97102 17.02 8.01201 18.41 8.44L178.51 60.68C180.025 61.2002 181.348 62.163 182.31 63.4438C183.271 64.7246 183.826 66.2645 183.902 67.8642C183.979 69.4638 183.573 71.0496 182.739 72.4163C181.904 73.783 180.678 74.8677 179.22 75.53L132.81 93.35C131.614 93.8702 130.563 94.6751 129.749 95.6946C128.935 96.7141 128.382 97.9171 128.14 99.199C127.897 100.481 127.972 101.803 128.357 103.049C128.742 104.295 129.426 105.429 130.35 106.35L181.66 157.66C182.407 158.403 182.999 159.287 183.404 160.26C183.808 161.233 184.016 162.276 184.016 163.33C184.016 164.384 183.808 165.427 183.404 166.4C182.999 167.373 182.407 168.257 181.66 169Z" fill="${cursorInnnerColor}"/>
      <path d="M136 100.69L182.08 83L182.41 82.87C185.359 81.5622 187.844 79.3935 189.539 76.6483C191.234 73.9032 192.059 70.7098 191.906 67.4873C191.754 64.2648 190.631 61.1637 188.684 58.5908C186.738 56.0179 184.059 54.0935 181 53.07L20.92 0.8C18.1189 -0.116758 15.1185 -0.239455 12.2519 0.445523C9.38528 1.1305 6.76451 2.59636 4.68044 4.68044C2.59636 6.76451 1.1305 9.38528 0.445523 12.2519C-0.239455 15.1185 -0.116758 18.1189 0.8 20.92L53.07 181C54.0551 184.089 55.9657 186.801 58.5431 188.769C61.1205 190.736 64.2403 191.864 67.48 192H68.26C71.3674 192.011 74.4094 191.107 77.0072 189.402C79.605 187.697 81.6439 185.265 82.87 182.41L83 182.08L100.69 136L152 187.31C153.486 188.796 155.25 189.975 157.191 190.779C159.133 191.584 161.214 191.998 163.315 191.998C165.416 191.998 167.497 191.584 169.439 190.779C171.38 189.975 173.144 188.796 174.63 187.31L187.31 174.63C188.796 173.144 189.975 171.38 190.779 169.439C191.584 167.497 191.998 165.416 191.998 163.315C191.998 161.214 191.584 159.133 190.779 157.191C189.975 155.25 188.796 153.486 187.31 152L136 100.69ZM163.31 176L112 124.69C110.157 122.843 107.889 121.475 105.396 120.705C102.903 119.936 100.259 119.787 97.6951 120.273C95.1314 120.76 92.7254 121.865 90.6869 123.494C88.6485 125.124 87.0394 127.226 86 129.62C86 129.73 85.91 129.84 85.87 129.94L68.22 175.94L16 16L175.85 68.2L129.9 85.84L129.58 85.97C127.186 87.0094 125.084 88.6185 123.454 90.6569C121.825 92.6954 120.72 95.1014 120.233 97.6651C119.747 100.229 119.896 102.873 120.665 105.366C121.435 107.859 122.803 110.127 124.65 111.97L176 163.31L163.31 176Z" fill="${cursorOuterColor}"/>
    </svg>
  `;
	  document.body.appendChild(cursorDiv);

	  // Füge die Maus-Tracking-Funktionalität hinzu
	  document.addEventListener('mousemove', (e) => {
	    cursorDiv.style.left = e.clientX + 'px';
	    cursorDiv.style.top = e.clientY + 'px';
	  });

	  document.addEventListener('mouseenter', () => {
	    cursorDiv.style.display = 'block';
	  });

	  document.addEventListener('mouseleave', () => {
	    cursorDiv.style.display = 'none';
	  });
	}

	// Export-Funktion zum Anpassen der SVG-Größe
	function setCursorSize(scale) {
	  const svgElement = document.getElementById('customCursorSVG');
	  const baseSize = 40;
	  cursorSize = baseSize * parseFloat(scale.replace('x', ''));
	  console.log(cursorSize);
	  svgElement.setAttribute('width', cursorSize);
	  svgElement.setAttribute('height', cursorSize);
	}

	function togShowCustomCursor(show) {
	  if (show) {
	    addCursor();
	  } else {
	    removeCursor();
	  }
	}

	function removeCursor() {
	  const cursorDiv = document.querySelector('.accessi_mouse-overlay');
	  if (cursorDiv) {
	    cursorDiv.remove();
	  }
	}

	function setCursorColor(color) {
	  cursorInnnerColor = color;
	  const svgElement = document.getElementById('customCursorSVG');
	  const innerPath = svgElement.querySelector('#inner-cursor-color-accessi');
	  cursorInnnerColor = color;
	  if (innerPath) {
	    innerPath.setAttribute('fill', cursorInnnerColor);
	  }
	}

	function loadReadingHelper(show) {
	    // Überprüfe, ob das div-Element bereits existiert
	    let readingHelper = document.querySelector('.accessi_reading-helper');

	    if (show) {
	        if (!readingHelper) {
	            // Erstelle das div-Element für den Balken
	            readingHelper = document.createElement('div');
	            readingHelper.className = 'accessi_reading-helper';

	            // Füge den CSS-Code zum Dokument hinzu
	            const style = document.createElement('style');
	            style.textContent = `
                .accessi_reading-helper {
                    position: fixed;
                    z-index: 100000000000;
                    width: 30vw;
                    height: 1.2rem;
                    max-width: 100vw;
                    min-width: 300px;
                    border-top-style: solid;
                    border-top-width: 6px;
                    border-top-color: hsla(0, 0.00%, 0.00%, 1.00);
                    border-right-style: solid;
                    border-right-width: 6px;
                    border-right-color: hsla(0, 0.00%, 0.00%, 1.00);
                    border-bottom-style: solid;
                    border-bottom-width: 6px;
                    border-bottom-color: hsla(0, 0.00%, 0.00%, 1.00);
                    border-left-style: solid;
                    border-left-width: 6px;
                    border-left-color: hsla(0, 0.00%, 0.00%, 1.00);
                    border-top-left-radius: 100rem;
                    border-top-right-radius: 100rem;
                    border-bottom-left-radius: 100rem;
                    border-bottom-right-radius: 100rem;
                    background-color: hsla(0, 100.00%, 50.00%, 1.00);
                    pointer-events: none;
                    margin-top: 15px;
                }
            `;
	            document.head.appendChild(style);
	            
	            // Füge das div zum Dokument hinzu
	            document.body.appendChild(readingHelper);

	            console.log('readingHelper', readingHelper);

	            // Setze eine Startposition für den Balken, damit er sichtbar ist
	            readingHelper.style.left = '0px';
	            readingHelper.style.top = '0px';

	            // Bewegungslogik für den Balken
	            document.addEventListener('mousemove', (e) => {
	                const helperHeight = readingHelper.offsetHeight / 2;
	                readingHelper.style.left = `${e.clientX - readingHelper.offsetWidth / 2}px`;
	                readingHelper.style.top = `${e.clientY - helperHeight}px`;
	            });
	        }
	    } else {
	        if (readingHelper) {
	            readingHelper.remove();
	            const style = document.querySelector('style');
	            if (style) {
	                style.remove();
	            }
	        }
	    }
	}

	// Map zur Speicherung der ursprünglichen text-transform Werte
	const originalTextTransforms = new Map();

	// Funktion zur Speicherung der ursprünglichen text-transform Werte
	function saveTextTransforms() {
	    const textElements = document.querySelectorAll('body :not([data-accessi-widget]) p, body :not([data-accessi-widget]) h1, body :not([data-accessi-widget]) h2, body :not([data-accessi-widget]) h3, body :not([data-accessi-widget]) h4, body :not([data-accessi-widget]) h5, body :not([data-accessi-widget]) h6, body :not([data-accessi-widget]) span, body :not([data-accessi-widget]) div, body :not([data-accessi-widget]) a');

	    textElements.forEach(element => {
	        if (!element.hasAttribute("data-accessi-none") && !hasAncestorWithAttribute(element, "data-accessi-none")) {
	            if (!originalTextTransforms.has(element)) {
	                originalTextTransforms.set(element, window.getComputedStyle(element).textTransform || 'none');
	            }
	        }
	    });
	}

	// Funktion, um die Textumwandlungen durchzuführen
	function applyTextTransform(transformType) {
	    // Alle Textelemente auf der Seite holen, außer denen innerhalb des Widgets
	    const textElements = document.querySelectorAll('body :not([data-accessi-widget]) p, body :not([data-accessi-widget]) h1, body :not([data-accessi-widget]) h2, body :not([data-accessi-widget]) h3, body :not([data-accessi-widget]) h4, body :not([data-accessi-widget]) h5, body :not([data-accessi-widget]) h6, body :not([data-accessi-widget]) span, body :not([data-accessi-widget]) div, body :not([data-accessi-widget]) a');

	    // Durch alle Textelemente iterieren und die Textumwandlung anwenden
	    textElements.forEach(element => {
	        if (!element.hasAttribute("data-accessi-none") && !hasAncestorWithAttribute(element, "data-accessi-none")) {
	            if (transformType === "none") {
	                // Ursprünglichen text-transform Wert wiederherstellen
	                if (originalTextTransforms.has(element)) {
	                    element.style.textTransform = originalTextTransforms.get(element);
	                }
	            } else {
	                if (!originalTextTransforms.has(element)) {
	                    originalTextTransforms.set(element, window.getComputedStyle(element).textTransform || 'none');
	                }
	                element.style.textTransform = transformType;
	            }
	        }
	    });
	}

	// Aufruf der Funktion beim Laden der Seite
	document.addEventListener('DOMContentLoaded', () => {
	    saveTextTransforms();
	});

	function testScreenReader(isActive) {
	    let tabCount = 0;  // Tracks section navigation (Navigation, Footer, Content)
	    let customTabActive = true;  // Determines if we are in section navigation mode
	    let previousElement = null;  // Keeps track of the last highlighted element
	    let sectionElements = [];  // Stores elements within a section
	    let elementIndex = -1;  // Tracks the current element inside a section
	    let insideSection = false;  // Flag to track if we are reading elements inside a section

	    // Add the style for the yellow highlight effect
	    const style = document.createElement('style');
	    style.textContent = `
        .screen-reader-highlight {
            outline: 2px solid yellow; /* Adds a yellow outline */
            background-color: rgba(255, 255, 0, 0.3); /* Light yellow background */
            transition: background-color 0.3s ease;
        }
    `;
	    document.head.appendChild(style);

	    document.addEventListener('keydown', function (event) {
	        if (event.key === 'Tab') {
	            event.preventDefault();

	            // Handle Tab for section navigation when not inside a section
	            if (!insideSection) {
	                handleCustomTabNavigation();
	            } else {
	                // If inside a section, pressing Tab should move to the next section
	                exitSectionAndMoveToNext();
	            }
	        }

	        if (event.key === 'Enter') {
	            if (!insideSection && customTabActive && previousElement) {
	                // Enter into the section when Enter is pressed the first time
	                insideSection = true;
	                sectionElements = getSectionElements(previousElement);  // Get the elements inside the section
	                elementIndex = -1;  // Reset the index for the elements inside the section
	                speakText("Entered section, press Enter to read individual items.");
	            } else if (insideSection) {
	                // Focus on the next element inside the section on subsequent Enter presses
	                focusNextInnerElement();
	            }
	        }
	    });

	    // Handles the custom Tab navigation between sections
	    function handleCustomTabNavigation() {
	        tabCount++;

	        if (tabCount === 1) {
	            speakText("Jump to navigation");
	            highlightElement(document.getElementById('navbar'));
	        } else if (tabCount === 2) {
	            speakText("Jump to footer");
	            highlightElement(document.getElementById('footer'));
	        } else if (tabCount === 3) {
	            speakText("Jump to content");
	            highlightElement(document.getElementById('main-content'));
	        } else if (tabCount === 4) {
	            // Reset to the beginning of sections (wrap around)
	            tabCount = 0;
	            handleCustomTabNavigation();  // Recursively call to reset back to navigation
	        }
	    }

	    // Exits the current section and moves to the next one by pressing Tab
	    function exitSectionAndMoveToNext() {
	        insideSection = false;  // Reset the flag to exit the section
	        tabCount++;  // Increment tab count to move to the next section
	        if (tabCount > 3) tabCount = 1;  // Wrap around if tab count exceeds sections
	        handleCustomTabNavigation();  // Call the section navigation logic
	    }

	    // Focuses and reads the next element inside a section
	    function focusNextInnerElement() {
	        if (sectionElements.length === 0) {
	            speakText("No items to read in this section.");
	            return;
	        }

	        elementIndex++;

	        if (elementIndex >= sectionElements.length) {
	            speakText("End of section, press Tab to move to the next section.");
	            insideSection = false;  // Reset the section navigation after reading all elements
	            return;
	        }

	        const currentElement = sectionElements[elementIndex];
	        currentElement.focus();
	        highlightElement(currentElement);
	        readElementContent(currentElement);
	    }

	    // Retrieves all interactive elements inside the currently focused section
	    function getSectionElements(section) {
	        // Retrieve interactive elements within the section
	        return section.querySelectorAll('button, a, img, p, h1, h2, h3, h4, h5, h6, span, div');
	    }

	    // Highlights the currently focused element and removes the highlight from the previous element
	    function highlightElement(element) {
	        if (previousElement) {
	            previousElement.classList.remove('screen-reader-highlight');
	        }

	        element.classList.add('screen-reader-highlight');
	        previousElement = element;
	    }

	    // Reads out the content of the focused element using the speech synthesis API
	    function readElementContent(element) {
	        let content = '';

	        if (element.tagName === 'IMG' && element.alt) {
	            content = `Image: ${element.alt}`;
	        } else {
	            content = element.innerText || element.textContent;
	        }

	        speakText(content);
	    }

	    // Uses the browser's speech synthesis API to read text aloud
	    function speakText(text) {
	        if (window.speechSynthesis.speaking) {
	            window.speechSynthesis.cancel();
	        }

	        const speech = new SpeechSynthesisUtterance(text);
	        window.speechSynthesis.speak(speech);
	    }
	}

	/* src\Widget.svelte generated by Svelte v4.2.18 */

	function add_css(target) {
		append_styles(target, "svelte-1q83lbh", ":root{--brand-blue:#5a26e3;--white:white;--border-radius:14px;--base-color-brand--white:var(--white);--accessi-widget-size:3.5rem;--font-body:Arial, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,\n\t\t\tCantarell, 'Open Sans', 'Helvetica Neue', sans-serif;--font-mono:'Fira Mono', monospace;--color-text:rgba(0, 0, 0, 0.7);--column-width:42rem;--column-margin-top:4rem;font-family:var(--font-body);color:var(--color-text)}.accessi_fixed.svelte-1q83lbh{font-family:Arial, Helvetica, sans-serif;line-height:1.5;letter-spacing:normal;width:100%;height:100%;z-index:214748364}.accessi_widget-open.svelte-1q83lbh{position:fixed;left:auto;top:auto;right:1rem;bottom:1rem;z-index:9007199254740991;display:flex;width:var(--accessi-widget-size);height:var(--accessi-widget-size);justify-content:center;align-items:center;border-radius:1000px;background-color:var(--brand-blue);transition-property:all;transition-duration:235ms;transition-timing-function:ease;color:var(--white)}.accessi_widget-open.svelte-1q83lbh:tiny{z-index:241000009}.accessi_widget-open.svelte-1q83lbh:hover{opacity:0.75}.accessi_open-icon.svelte-1q83lbh{position:relative;width:3rem;height:3rem}.accessi_close-icon.svelte-1q83lbh{position:absolute;width:3rem;height:3rem}button.svelte-1q83lbh{all:unset;display:inline-block;cursor:pointer}.acessi_widget.svelte-1q83lbh{position:fixed;z-index:2147483647;left:auto;top:auto;right:1rem;bottom:5.5rem;overflow:hidden;width:100%;height:85%;max-width:33rem;border-style:solid;border-width:1px;border-color:hsla(0, 0%, 0%, 0.08);border-radius:var(--border-radius);background-color:white;box-shadow:0 2px 40px 8px rgba(0, 0, 0, 0.1);max-height:calc(100vh - 5rem);text-transform:none}.acessi_widget.svelte-1q83lbh:tiny{left:0.3rem;top:0.3rem;right:0.3rem;bottom:0.3rem;z-index:9007199254740991;max-height:none;max-width:calc(100vw - 0.6rem);height:calc(100vh - 0.6rem)}.accessi_heading.svelte-1q83lbh{font-size:1.05rem;font-weight:500;text-align:left !important;width:100%;text-transform:none !important}.accessi_widget-gradient.svelte-1q83lbh{position:absolute;left:0%;top:0%;right:0%;bottom:auto;height:40%;background-image:linear-gradient(180deg, var(--brand-blue) 62%, hsla(0, 0%, 100%, 0));pointer-events:none}.accessi_widget-menu-wrapper.svelte-1q83lbh{position:relative;overflow:auto;height:100%}.accessi_top-bar.svelte-1q83lbh{position:sticky;top:0px;z-index:100;display:flex;width:100%;padding:1rem;justify-content:space-between;align-items:center;background-image:linear-gradient(180deg, var(--brand-blue) 22%, transparent)}.accessi_language-wrapper.svelte-1q83lbh{display:flex;justify-content:flex-start;align-items:center;grid-column-gap:0.5rem;grid-row-gap:0.5rem}.accessi_language-link.svelte-1q83lbh{display:flex;padding-top:0.3rem;padding-right:0.75rem;padding-bottom:0.3rem;padding-left:0.3rem;justify-content:flex-start;align-items:center;grid-column-gap:0.5rem;grid-row-gap:0.5rem;border-top-left-radius:100px;border-top-right-radius:100px;border-bottom-left-radius:100px;border-bottom-right-radius:100px;background-color:hsla(0, 0%, 100%, 0.22);color:var(--white);font-size:0.8rem;text-decoration:none}.accessi_action-button.svelte-1q83lbh{display:flex;padding-top:0.3rem;padding-right:0.8rem;padding-bottom:0.3rem;padding-left:0.7rem;justify-content:flex-start;align-items:center;grid-column-gap:0.35rem;grid-row-gap:0.35rem;border-top-left-radius:100px;border-top-right-radius:100px;border-bottom-left-radius:100px;border-bottom-right-radius:100px;background-color:white;transition-property:all;transition-duration:250ms;transition-timing-function:ease;color:var(--brand-blue);font-size:0.8rem;text-decoration:none}.accessi_action-button.svelte-1q83lbh:hover{opacity:0.88;transform:scale(1.04)}.accessi_action-button.secondary.svelte-1q83lbh{padding-right:0.3rem;padding-left:0.3rem;background-color:rgba(255, 255, 255, 0.22);color:var(--white);font-size:0.7rem}.accessi_close.svelte-1q83lbh{width:1.6rem;height:1.6rem;color:var(--white)}.accessi_widget-scroll.svelte-1q83lbh{width:100%}.spacer-small.svelte-1q83lbh{width:100%;padding-top:1rem}.spacer-small.svelte-1q83lbh:small{padding-top:1.25rem}.accessi_hero-header.svelte-1q83lbh{display:flex;flex-direction:column;justify-content:center;flex-wrap:nowrap;align-items:center;grid-column-gap:1rem;grid-row-gap:1rem}.max-width-medium.svelte-1q83lbh{display:flex;width:100%;max-width:25rem;justify-content:center;align-items:center}.accessi_hero-title.svelte-1q83lbh{color:var(--base-color-brand--white);font-size:1.8rem;font-weight:600;text-align:center;width:100%;line-height:1.6}.embed-svg.btn.svelte-1q83lbh{width:1.75rem;height:1.75rem}.embed-svg.btn.underline.svelte-1q83lbh{border-bottom-style:solid;border-bottom-width:1.5px;border-bottom-color:black}.accessi_action-button-wraper.svelte-1q83lbh{display:flex;width:100%;justify-content:center;align-items:center;grid-auto-columns:1fr;grid-column-gap:0.6rem;grid-row-gap:0.6rem;grid-template-columns:1fr 1fr 1fr;grid-template-rows:auto}.accessi_action-button-wraper.svelte-1q83lbh:tiny{flex-direction:column;flex-wrap:nowrap}.accessi_action-button.svelte-1q83lbh{display:flex;padding-top:0.3rem;padding-right:0.8rem;padding-bottom:0.3rem;padding-left:0.7rem;justify-content:flex-start;align-items:center;grid-column-gap:0.35rem;grid-row-gap:0.35rem;border-top-left-radius:100px;border-top-right-radius:100px;border-bottom-left-radius:100px;border-bottom-right-radius:100px;background-color:white;transition-property:all;transition-duration:250ms;transition-timing-function:ease;color:var(--brand-blue);font-size:0.8rem;text-decoration:none}.accessi_action-button.svelte-1q83lbh:hover{opacity:0.88;transform:scale(1.04)}.spacer-large.svelte-1q83lbh{width:100%;padding-top:2rem}.spacer-large.svelte-1q83lbh:medium{padding-top:2.5rem}.spacer-large.svelte-1q83lbh:small{padding-top:2rem}.accessi_widget-content-wrapper.svelte-1q83lbh{display:flex;padding-right:1rem;padding-left:1rem;flex-direction:column;flex-wrap:nowrap;grid-column-gap:0.75rem;grid-row-gap:0.75rem;margin-bottom:1rem}.accessi_widget-content-wrapper.svelte-1q83lbh:tiny{padding-right:0.4rem;padding-left:0.4rem}.accessi_form-wrapper.svelte-1q83lbh{display:flex;flex-direction:column;flex-wrap:nowrap;grid-column-gap:1.25rem;grid-row-gap:1.25rem}.accessi_form-wrapper.svelte-1q83lbh:tiny{grid-column-gap:1rem;grid-row-gap:1rem}.accessi_widget-content-item.svelte-1q83lbh{padding-top:1rem;color:#1a1a1a;padding-right:1.2rem;padding-bottom:1rem;padding-left:1.2rem;border-top-left-radius:10px;border-top-right-radius:10px;border-bottom-left-radius:10px;border-bottom-right-radius:10px;background-color:hsla(256.42105263157896, 0%, 100%, 1);box-shadow:0 0 30px 3px rgba(0, 0, 0, 0.13);text-align:left !important}.accessi_widget-content-item.svelte-1q83lbh:tiny{padding-right:0.75rem;padding-left:0.75rem}.spacer-small.svelte-1q83lbh{width:100%;padding-top:1rem}.spacer-small.svelte-1q83lbh:small{padding-top:1.25rem}.accessi_widget-vertical-wrapper.svelte-1q83lbh{display:grid;flex-direction:column;flex-wrap:nowrap;grid-auto-columns:1fr;grid-column-gap:0.75rem;grid-row-gap:0.75rem;grid-template-columns:1fr 1fr;grid-template-rows:auto}.accessi_widget-vertical-wrapper.svelte-1q83lbh:tiny{grid-auto-flow:row;grid-column-gap:0.5rem;grid-row-gap:0.5rem;grid-template-columns:1fr}.embed-svg.svelte-1q83lbh{width:1.2rem;height:1.2rem}.embed-svg.profiles.svelte-1q83lbh{width:2.1rem;height:2.1rem;padding-top:0.37rem;padding-right:0.37rem;padding-bottom:0.37rem;padding-left:0.37rem;border-top-left-radius:100px;border-top-right-radius:100px;border-bottom-left-radius:100px;border-bottom-right-radius:100px;background-color:hsla(0, 0%, 90.67%, 1)}.embed-svg.profiles.pressed.svelte-1q83lbh{display:flex;justify-content:center;align-items:center;background-color:hsla(0, 0%, 90.67%, 0.35)}.embed-svg.check.svelte-1q83lbh{position:absolute;left:auto;top:0%;right:0.7rem;bottom:0%;display:flex;width:1.5rem;height:100%;justify-content:center;align-items:center}.accessi_widget-vertical-item.svelte-1q83lbh{position:relative;display:flex;min-height:3rem;margin-bottom:0px;padding-top:0.3rem;padding-right:0.35rem;padding-bottom:0.3rem;padding-left:0.85rem;justify-content:flex-start;align-items:center;color:#1a1a1a;grid-column-gap:0.5rem;grid-row-gap:0.5rem;border-top-style:solid;border-top-width:1.75px;border-top-color:hsla(0, 0%, 100%, 1);border-right-style:solid;border-right-width:1.75px;border-right-color:hsla(0, 0%, 100%, 1);border-bottom-style:solid;border-bottom-width:1.75px;border-bottom-color:hsla(0, 0%, 100%, 1);border-left-style:solid;border-left-width:1.75px;border-left-color:hsla(0, 0%, 100%, 1);border-top-left-radius:9px;border-top-right-radius:9px;border-bottom-left-radius:9px;border-bottom-right-radius:9px;background-color:hsla(0, 0%, 100%, 1);box-shadow:0 0 20px 1px hsla(0, 0%, 0%, 0.13);transition-property:all;transition-duration:300ms;transition-timing-function:ease;font-size:0.92rem}.accessi_widget-vertical-item.svelte-1q83lbh:hover{border-top-color:var(--brand-blue);border-right-color:var(--brand-blue);border-bottom-color:var(--brand-blue);border-left-color:var(--brand-blue)}.accessi_widget-vertical-item.svelte-1q83lbh:tiny{min-height:3.5rem}.accessi_widget-vertical-item.pressed.svelte-1q83lbh{border-top-color:var(--brand-blue);border-right-color:var(--brand-blue);border-bottom-color:var(--brand-blue);border-left-color:var(--brand-blue);background-color:var(--brand-blue);color:var(--base-color-brand--white)}.accessi_widget-vertical-wrapper.svelte-1q83lbh{display:grid;flex-direction:column;flex-wrap:nowrap;grid-auto-columns:1fr;grid-column-gap:0.75rem;grid-row-gap:0.75rem;grid-template-columns:1fr 1fr;grid-template-rows:auto}.accessi_widget-vertical-wrapper.svelte-1q83lbh:tiny{grid-auto-flow:row;grid-column-gap:0.5rem;grid-row-gap:0.5rem;grid-template-columns:1fr}.accessi_widget-vertical-wrapper._3grid.svelte-1q83lbh{grid-template-columns:1fr 1fr 1fr;grid-auto-flow:dense}.accessi_widget-vertical-wrapper._3grid.svelte-1q83lbh:tiny{grid-template-columns:1fr 1fr}.accessi_button-wrapper.svelte-1q83lbh{display:flex;padding-top:0.35rem;padding-right:0.35rem;padding-bottom:0.35rem;padding-left:0.35rem;flex-direction:column;justify-content:center;flex-wrap:nowrap;align-items:center;aspect-ratio:3/2.5;text-align:center}.accessi_button-wrapper.accessi_widget-vertical-item.svelte-1q83lbh{font-size:0.92rem}.accessi_widget-vertical-left.center.svelte-1q83lbh{display:flex;justify-content:center;align-items:center}.embed-svg.btn.svelte-1q83lbh{width:1.75rem;height:1.75rem}.accessi_button-wrapper.svelte-1q83lbh{display:flex;padding-top:0.35rem;padding-right:0.35rem;padding-bottom:0.35rem;padding-left:0.35rem;flex-direction:column;justify-content:center;flex-wrap:nowrap;align-items:center;aspect-ratio:3/2.5;text-align:center}.accessi_button-wrapper.accessi_widget-vertical-item.svelte-1q83lbh{font-size:0.92rem}.accessi_button-wrapper.accessi_widget-vertical-item.full-width.svelte-1q83lbh{aspect-ratio:3/1.2}.accessi_horizontal.svelte-1q83lbh{display:flex;justify-content:flex-start;align-items:center;grid-column-gap:0.55rem;grid-row-gap:0.55rem}.accessi_widget-vertical-left.center.svelte-1q83lbh{display:flex;justify-content:center;align-items:center}.accessi_button-wrapper.svelte-1q83lbh{display:flex;padding-top:0.35rem;padding-right:0.35rem;padding-bottom:0.35rem;padding-left:0.35rem;flex-direction:column;justify-content:center;flex-wrap:nowrap;align-items:center;aspect-ratio:3/2.5;text-align:center}.accessi_button-wrapper.accessi_widget-vertical-item.svelte-1q83lbh{font-size:0.92rem}.accessi_button-wrapper.accessi_widget-vertical-item.full-width.svelte-1q83lbh{aspect-ratio:3/1.2;grid-column:span 2}.embed-svg.btn.underline.pressed.svelte-1q83lbh{border-bottom-color:white}.accessi_color-wrapper.svelte-1q83lbh{display:flex;width:85%;flex-direction:row;justify-content:center;flex-wrap:wrap;align-items:center;grid-column-gap:0.3rem;grid-row-gap:0.3rem}.accessi_color-wrapper.svelte-1q83lbh:tiny{background-color:transparent}.accessi_color-dot.svelte-1q83lbh{width:1.8rem;height:1.8rem;border-top-left-radius:100px;border-top-right-radius:100px;border-bottom-left-radius:100px;border-bottom-right-radius:100px;transition-property:all;transition-duration:200ms;transition-timing-function:ease}.accessi_color-dot.svelte-1q83lbh:hover{transform:scale(1.1)}.accessi_color-dot.blue.svelte-1q83lbh{background-color:#389cfb}.accessi_color-dot.orange.svelte-1q83lbh{background-color:#fa6b05}.accessi_color-dot.yellow.svelte-1q83lbh{background-color:#facf36}.accessi_color-dot.turquoise.svelte-1q83lbh{background-color:#5cd6c8}.accessi_color-dot.white.svelte-1q83lbh{border-top-style:solid;border-top-width:1px;border-top-color:hsla(0, 0%, 63.33%, 1);border-right-style:solid;border-right-width:1px;border-right-color:hsla(0, 0%, 63.33%, 1);border-bottom-style:solid;border-bottom-width:1px;border-bottom-color:hsla(0, 0%, 63.33%, 1);border-left-style:solid;border-left-width:1px;border-left-color:hsla(0, 0%, 63.33%, 1)}.accessi_color-dot.black.svelte-1q83lbh{background-color:#521442}.accessi_langugae-icon.svelte-1q83lbh{width:1.5rem;height:1.5rem;border-top-left-radius:100px;border-top-right-radius:100px;border-bottom-left-radius:100px;border-bottom-right-radius:100px;object-fit:cover}.accessi_num-wrapper.svelte-1q83lbh{position:relative;display:flex;width:90%;height:2.5rem;flex-direction:row;justify-content:center;flex-wrap:nowrap;align-items:center;grid-column-gap:0.45rem;grid-row-gap:0.45rem;font-weight:500}.accessi_num-wrapper.svelte-1q83lbh:tiny{background-color:transparent}.accessi_num-button.svelte-1q83lbh{display:flex;padding-top:0.4rem;padding-right:1rem;padding-bottom:0.4rem;padding-left:1rem;justify-content:center;align-items:center;grid-column-gap:0.5rem;grid-row-gap:0.5rem;border-top-style:solid;border-top-width:1.5px;border-top-color:hsla(0, 0%, 100%, 1);border-right-style:solid;border-right-width:1.5px;border-right-color:hsla(0, 0%, 100%, 1);border-bottom-style:solid;border-bottom-width:1.5px;border-bottom-color:hsla(0, 0%, 100%, 1);border-left-style:solid;border-left-width:1.5px;border-left-color:hsla(0, 0%, 100%, 1);border-top-left-radius:100px;border-top-right-radius:100px;border-bottom-left-radius:100px;border-bottom-right-radius:100px;box-shadow:0 0 16px 0 rgba(0, 0, 0, 0.16);transition-property:all;transition-duration:290ms;transition-timing-function:ease;color:var(--base-color-brand--black);text-decoration:none}.accessi_num-button.svelte-1q83lbh:hover{border-top-color:var(--brand-blue);border-right-color:var(--brand-blue);border-bottom-color:var(--brand-blue);border-left-color:var(--brand-blue)}.accessi_num-button.pressed.svelte-1q83lbh{border-top-color:var(--brand-blue);border-right-color:var(--brand-blue);border-bottom-color:var(--brand-blue);border-left-color:var(--brand-blue);background-color:var(--brand-blue);color:var(--base-color-brand--white)}.accessi_footer.svelte-1q83lbh{position:absolute;left:0%;top:auto;right:0%;bottom:0%;display:flex;padding-top:0.2rem;padding-right:0.15rem;padding-bottom:0.15rem;padding-left:0.15rem;justify-content:center;align-items:center;background-color:var(--brand-blue);color:white;font-size:0.85rem;text-decoration:none}.accessi_underline.svelte-1q83lbh{text-decoration:underline}");
	}

	// (253:0) {#if showWidget}
	function create_if_block(ctx) {
		let button;
		let current_block_type_index;
		let if_block0;
		let t;
		let if_block1_anchor;
		let mounted;
		let dispose;
		const if_block_creators = [create_if_block_4, create_else_block];
		const if_blocks = [];

		function select_block_type(ctx, dirty) {
			if (/*isOpen*/ ctx[0] != true) return 0;
			return 1;
		}

		current_block_type_index = select_block_type(ctx);
		if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
		let if_block1 = /*isOpen*/ ctx[0] && create_if_block_1(ctx);

		return {
			c() {
				button = element("button");
				if_block0.c();
				t = space();
				if (if_block1) if_block1.c();
				if_block1_anchor = empty();
				attr(button, "data-accessi-none", "");
				attr(button, "class", "accessi_widget-open svelte-1q83lbh");
				attr(button, "alt", "Accessibility Settings");
			},
			m(target, anchor) {
				insert(target, button, anchor);
				if_blocks[current_block_type_index].m(button, null);
				insert(target, t, anchor);
				if (if_block1) if_block1.m(target, anchor);
				insert(target, if_block1_anchor, anchor);

				if (!mounted) {
					dispose = listen(button, "click", prevent_default(/*toggleWidget*/ ctx[27]));
					mounted = true;
				}
			},
			p(ctx, dirty) {
				let previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);

				if (current_block_type_index !== previous_block_index) {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
					if_block0 = if_blocks[current_block_type_index];

					if (!if_block0) {
						if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block0.c();
					}

					transition_in(if_block0, 1);
					if_block0.m(button, null);
				}

				if (/*isOpen*/ ctx[0]) {
					if (if_block1) {
						if_block1.p(ctx, dirty);

						if (dirty[0] & /*isOpen*/ 1) {
							transition_in(if_block1, 1);
						}
					} else {
						if_block1 = create_if_block_1(ctx);
						if_block1.c();
						transition_in(if_block1, 1);
						if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
					}
				} else if (if_block1) {
					group_outros();

					transition_out(if_block1, 1, 1, () => {
						if_block1 = null;
					});

					check_outros();
				}
			},
			d(detaching) {
				if (detaching) {
					detach(button);
					detach(t);
					detach(if_block1_anchor);
				}

				if_blocks[current_block_type_index].d();
				if (if_block1) if_block1.d(detaching);
				mounted = false;
				dispose();
			}
		};
	}

	// (293:2) {:else}
	function create_else_block(ctx) {
		let div;
		let div_intro;
		let div_outro;
		let current;

		return {
			c() {
				div = element("div");
				div.innerHTML = `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="Menu / Close_MD"><path id="Vector" d="M18 18L12 12M12 12L6 6M12 12L18 6M12 12L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></g></svg>`;
				attr(div, "class", "accessi_close-icon svelte-1q83lbh");
			},
			m(target, anchor) {
				insert(target, div, anchor);
				current = true;
			},
			i(local) {
				if (current) return;

				if (local) {
					add_render_callback(() => {
						if (!current) return;
						if (div_outro) div_outro.end(1);
						div_intro = create_in_transition(div, fade, { duration: 300 });
						div_intro.start();
					});
				}

				current = true;
			},
			o(local) {
				if (div_intro) div_intro.invalidate();

				if (local) {
					div_outro = create_out_transition(div, fade, { duration: 200 });
				}

				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(div);
				}

				if (detaching && div_outro) div_outro.end();
			}
		};
	}

	// (260:2) {#if isOpen != true}
	function create_if_block_4(ctx) {
		let div;
		let div_intro;
		let div_outro;
		let current;

		return {
			c() {
				div = element("div");
				div.innerHTML = `<svg width="100%" height="100%" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M400 733.333C584.093 733.333 733.333 584.093 733.333 400C733.333 215.905 584.093 66.6667 400 66.6667C215.905 66.6667 66.6667 215.905 66.6667 400C66.6667 584.093 215.905 733.333 400 733.333Z" stroke="currentColor" stroke-width="50" stroke-linecap="round" stroke-linejoin="round"></path><path d="M233.333 300L400 333.333M400 333.333L566.667 300M400 333.333V433.333M400 433.333L333.333 600M400 433.333L466.667 600" stroke="currentColor" stroke-width="50" stroke-linecap="round" stroke-linejoin="round"></path><path d="M400 233.333C390.797 233.333 383.333 225.871 383.333 216.667C383.333 207.462 390.797 200 400 200C409.203 200 416.667 207.462 416.667 216.667C416.667 225.871 409.203 233.333 400 233.333Z" fill="white" stroke="currentColor" stroke-width="50" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;
				attr(div, "class", "accessi_open-icon svelte-1q83lbh");
			},
			m(target, anchor) {
				insert(target, div, anchor);
				current = true;
			},
			i(local) {
				if (current) return;

				if (local) {
					add_render_callback(() => {
						if (!current) return;
						if (div_outro) div_outro.end(1);
						div_intro = create_in_transition(div, fade, { duration: 300 });
						div_intro.start();
					});
				}

				current = true;
			},
			o(local) {
				if (div_intro) div_intro.invalidate();

				if (local) {
					div_outro = create_out_transition(div, fade, { duration: 200 });
				}

				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(div);
				}

				if (detaching && div_outro) div_outro.end();
			}
		};
	}

	// (318:1) {#if isOpen}
	function create_if_block_1(ctx) {
		let div131;
		let div130;
		let div0;
		let t0;
		let div129;
		let div128;
		let div4;
		let div3;
		let t5;
		let button0;
		let t6;
		let div5;
		let t7;
		let div10;
		let div6;
		let t9;
		let div9;
		let button1;
		let t12;
		let button2;
		let t15;
		let div11;
		let t16;
		let div127;
		let form;
		let div126;
		let div21;
		let span4;
		let t18;
		let div12;
		let t19;
		let div20;
		let button3;
		let div13;
		let t20;
		let span5;
		let t22;
		let t23;
		let button4;
		let t27;
		let button5;
		let t31;
		let button6;
		let t35;
		let div57;
		let span9;
		let t37;
		let div22;
		let t38;
		let div56;
		let button7;
		let t41;
		let button8;
		let div26;
		let div25;
		let t42;
		let span11;
		let t44;
		let button9;
		let div28;
		let div27;
		let t45;
		let span12;
		let t47;
		let button10;
		let t50;
		let div35;
		let div33;
		let t53;
		let div34;
		let button11;
		let t55;
		let button12;
		let t57;
		let button13;
		let t59;
		let button14;
		let t61;
		let button15;
		let t64;
		let div42;
		let div40;
		let t67;
		let div41;
		let button16;
		let t69;
		let button17;
		let t71;
		let button18;
		let t73;
		let button19;
		let t75;
		let button20;
		let t78;
		let div49;
		let div47;
		let t81;
		let div48;
		let button21;
		let t83;
		let button22;
		let t85;
		let button23;
		let t87;
		let button24;
		let t89;
		let button25;
		let t92;
		let button26;
		let t95;
		let button27;
		let t98;
		let div98;
		let span34;
		let t100;
		let div58;
		let t101;
		let div97;
		let button28;
		let t104;
		let button29;
		let t107;
		let button30;
		let t110;
		let button31;
		let t113;
		let div72;
		let div69;
		let t116;
		let div70;
		let button32;
		let t117;
		let button33;
		let t118;
		let button34;
		let t119;
		let button35;
		let t120;
		let button36;
		let t121;
		let button37;
		let t122;
		let div71;
		let button38;
		let t124;
		let button39;
		let t127;
		let div80;
		let div77;
		let t130;
		let div78;
		let button40;
		let t131;
		let button41;
		let t132;
		let button42;
		let t133;
		let button43;
		let t134;
		let button44;
		let t135;
		let button45;
		let t136;
		let div79;
		let button46;
		let t138;
		let button47;
		let t141;
		let div88;
		let div85;
		let t144;
		let div86;
		let button48;
		let t145;
		let button49;
		let t146;
		let button50;
		let t147;
		let button51;
		let t148;
		let button52;
		let t149;
		let button53;
		let t150;
		let div87;
		let button54;
		let t152;
		let button55;
		let t155;
		let div96;
		let div93;
		let t158;
		let div94;
		let button56;
		let t159;
		let button57;
		let t160;
		let button58;
		let t161;
		let button59;
		let t162;
		let button60;
		let t163;
		let button61;
		let t164;
		let div95;
		let button62;
		let t166;
		let div125;
		let span46;
		let t168;
		let div99;
		let t169;
		let div124;
		let button63;
		let t172;
		let button64;
		let t175;
		let button65;
		let t178;
		let button66;
		let t181;
		let div112;
		let div110;
		let t184;
		let div111;
		let button67;
		let t186;
		let button68;
		let t188;
		let button69;
		let t190;
		let button70;
		let t192;
		let button71;
		let t195;
		let div119;
		let div117;
		let t198;
		let div118;
		let button72;
		let t199;
		let button73;
		let t200;
		let button74;
		let t201;
		let button75;
		let t202;
		let button76;
		let t203;
		let button77;
		let t204;
		let button78;
		let t207;
		let button79;
		let t210;
		let div130_intro;
		let div130_outro;
		let current;
		let mounted;
		let dispose;
		let if_block0 = /*profileBlind*/ ctx[2] && create_if_block_3();
		let if_block1 = create_if_block_2();

		return {
			c() {
				div131 = element("div");
				div130 = element("div");
				div0 = element("div");
				t0 = space();
				div129 = element("div");
				div128 = element("div");
				div4 = element("div");
				div3 = element("div");
				div3.innerHTML = `<a data-accessi-none="" href="/" class="accessi_language-link svelte-1q83lbh"><img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Flag_of_Germany.svg" alt="Germany Flag" class="accessi_langugae-icon svelte-1q83lbh"/> <span>Deutsch</span></a> <a data-accessi-none="" href="/" class="accessi_action-button secondary svelte-1q83lbh"><div class="embed-svg small svelte-1q83lbh"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="User / User_Circle"><path id="Vector" d="M17.2166 19.3323C15.9349 17.9008 14.0727 17 12 17C9.92734 17 8.06492 17.9008 6.7832 19.3323M12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21ZM12 14C10.3431 14 9 12.6569 9 11C9 9.34315 10.3431 8 12 8C13.6569 8 15 9.34315 15 11C15 12.6569 13.6569 14 12 14Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></g></svg></div></a> <a data-accessi-none="" href="/" class="accessi_action-button secondary svelte-1q83lbh"><div class="embed-svg small svelte-1q83lbh"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="Warning / Info"><path id="Vector" d="M12 11V16M12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21ZM12.0498 8V8.1L11.9502 8.1002V8H12.0498Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></g></svg></div></a>`;
				t5 = space();
				button0 = element("button");
				button0.innerHTML = `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 18L12 12M12 12L18 6M12 12L6 6M12 12L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;
				t6 = space();
				div5 = element("div");
				t7 = space();
				div10 = element("div");
				div6 = element("div");
				div6.innerHTML = `<span class="accessi_hero-title svelte-1q83lbh">Accessibilitysettings</span>`;
				t9 = space();
				div9 = element("div");
				button1 = element("button");
				button1.innerHTML = `<div class="embed-svg small svelte-1q83lbh"><svg width="100%" height="100%" viewBox="0 0 23 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="Arrow / Arrow_Undo_Up_Left"><path id="Vector" d="M6.70833 13L2.875 9M2.875 9L6.70833 5M2.875 9H15.3333C17.9797 9 20.125 11.2386 20.125 14C20.125 16.7614 17.9797 19 15.3333 19H10.5417" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></g></svg></div> <span>Einstellungen zurücksetzen</span>`;
				t12 = space();
				button2 = element("button");
				button2.innerHTML = `<div class="embed-svg small svelte-1q83lbh"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="Edit / Hide"><path id="Vector" d="M3.99989 4L19.9999 20M16.4999 16.7559C15.1473 17.4845 13.6185 17.9999 11.9999 17.9999C8.46924 17.9999 5.36624 15.5478 3.5868 13.7788C3.1171 13.3119 2.88229 13.0784 2.7328 12.6201C2.62619 12.2933 2.62616 11.7066 2.7328 11.3797C2.88233 10.9215 3.11763 10.6875 3.58827 10.2197C4.48515 9.32821 5.71801 8.26359 7.17219 7.42676M19.4999 14.6335C19.8329 14.3405 20.138 14.0523 20.4117 13.7803L20.4146 13.7772C20.8832 13.3114 21.1182 13.0779 21.2674 12.6206C21.374 12.2938 21.3738 11.7068 21.2672 11.38C21.1178 10.9219 20.8827 10.6877 20.4133 10.2211C18.6338 8.45208 15.5305 6 11.9999 6C11.6624 6 11.3288 6.02241 10.9999 6.06448M13.3228 13.5C12.9702 13.8112 12.5071 14 11.9999 14C10.8953 14 9.99989 13.1046 9.99989 12C9.99989 11.4605 10.2135 10.9711 10.5608 10.6113" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></g></svg></div> <span>Oberfläche ausblenden</span>`;
				t15 = space();
				div11 = element("div");
				t16 = space();
				div127 = element("div");
				form = element("form");
				div126 = element("div");
				div21 = element("div");
				span4 = element("span");
				span4.textContent = "Wählen Sie das richtige Zugänglichkeitsprofil";
				t18 = space();
				div12 = element("div");
				t19 = space();
				div20 = element("div");
				button3 = element("button");
				div13 = element("div");
				div13.innerHTML = `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="Edit / Show"><g id="Vector"><path d="M3.5868 13.7788C5.36623 15.5478 8.46953 17.9999 12.0002 17.9999C15.5308 17.9999 18.6335 15.5478 20.413 13.7788C20.8823 13.3123 21.1177 13.0782 21.2671 12.6201C21.3738 12.2933 21.3738 11.7067 21.2671 11.3799C21.1177 10.9218 20.8823 10.6877 20.413 10.2211C18.6335 8.45208 15.5308 6 12.0002 6C8.46953 6 5.36623 8.45208 3.5868 10.2211C3.11714 10.688 2.88229 10.9216 2.7328 11.3799C2.62618 11.7067 2.62618 12.2933 2.7328 12.6201C2.88229 13.0784 3.11714 13.3119 3.5868 13.7788Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M10 12C10 13.1046 10.8954 14 12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></g></g></svg>`;
				t20 = space();
				span5 = element("span");
				span5.textContent = "Blind";
				t22 = space();
				if (if_block0) if_block0.c();
				t23 = space();
				button4 = element("button");
				button4.innerHTML = `<div class="embed-svg profiles svelte-1q83lbh"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="Edit / Show"><g id="Vector"><path d="M3.5868 13.7788C5.36623 15.5478 8.46953 17.9999 12.0002 17.9999C15.5308 17.9999 18.6335 15.5478 20.413 13.7788C20.8823 13.3123 21.1177 13.0782 21.2671 12.6201C21.3738 12.2933 21.3738 11.7067 21.2671 11.3799C21.1177 10.9218 20.8823 10.6877 20.413 10.2211C18.6335 8.45208 15.5308 6 12.0002 6C8.46953 6 5.36623 8.45208 3.5868 10.2211C3.11714 10.688 2.88229 10.9216 2.7328 11.3799C2.62618 11.7067 2.62618 12.2933 2.7328 12.6201C2.88229 13.0784 3.11714 13.3119 3.5868 13.7788Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M10 12C10 13.1046 10.8954 14 12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></g></g></svg></div> <span>Color Blind</span> <div class="embed-svg check svelte-1q83lbh"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="Interface / Check"><path id="Vector" d="M6 12L10.2426 16.2426L18.727 7.75732" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></g></svg></div>`;
				t27 = space();
				button5 = element("button");
				button5.innerHTML = `<div class="embed-svg profiles svelte-1q83lbh"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="Edit / Show"><g id="Vector"><path d="M3.5868 13.7788C5.36623 15.5478 8.46953 17.9999 12.0002 17.9999C15.5308 17.9999 18.6335 15.5478 20.413 13.7788C20.8823 13.3123 21.1177 13.0782 21.2671 12.6201C21.3738 12.2933 21.3738 11.7067 21.2671 11.3799C21.1177 10.9218 20.8823 10.6877 20.413 10.2211C18.6335 8.45208 15.5308 6 12.0002 6C8.46953 6 5.36623 8.45208 3.5868 10.2211C3.11714 10.688 2.88229 10.9216 2.7328 11.3799C2.62618 11.7067 2.62618 12.2933 2.7328 12.6201C2.88229 13.0784 3.11714 13.3119 3.5868 13.7788Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M10 12C10 13.1046 10.8954 14 12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></g></g></svg></div> <span>ADHD Friendly</span> <div class="embed-svg check svelte-1q83lbh"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="Interface / Check"><path id="Vector" d="M6 12L10.2426 16.2426L18.727 7.75732" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></g></svg></div>`;
				t31 = space();
				button6 = element("button");
				button6.innerHTML = `<div class="embed-svg profiles svelte-1q83lbh"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="Edit / Show"><g id="Vector"><path d="M3.5868 13.7788C5.36623 15.5478 8.46953 17.9999 12.0002 17.9999C15.5308 17.9999 18.6335 15.5478 20.413 13.7788C20.8823 13.3123 21.1177 13.0782 21.2671 12.6201C21.3738 12.2933 21.3738 11.7067 21.2671 11.3799C21.1177 10.9218 20.8823 10.6877 20.413 10.2211C18.6335 8.45208 15.5308 6 12.0002 6C8.46953 6 5.36623 8.45208 3.5868 10.2211C3.11714 10.688 2.88229 10.9216 2.7328 11.3799C2.62618 11.7067 2.62618 12.2933 2.7328 12.6201C2.88229 13.0784 3.11714 13.3119 3.5868 13.7788Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M10 12C10 13.1046 10.8954 14 12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></g></g></svg></div> <span>ADHD Friendly</span> <div class="embed-svg check svelte-1q83lbh"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="Interface / Check"><path id="Vector" d="M6 12L10.2426 16.2426L18.727 7.75732" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></g></svg></div>`;
				t35 = space();
				div57 = element("div");
				span9 = element("span");
				span9.textContent = "Wählen Sie das richtige Zugänglichkeitsprofil";
				t37 = space();
				div22 = element("div");
				t38 = space();
				div56 = element("div");
				button7 = element("button");
				button7.innerHTML = `<div class="accessi_widget-vertical-left center svelte-1q83lbh"><div class="embed-svg btn svelte-1q83lbh"><svg width="100%" height="100%" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 5.33331H29.3333V7.99998H20V5.33331ZM21.3333 10.6666H29.3333V13.3333H21.3333V10.6666ZM24 16H29.3333V18.6666H24V16ZM12.4093 5.33331L4.40933 26.6666H7.25867L9.75867 20H18.2427L20.7427 26.6666H23.592L15.592 5.33331H12.4093ZM10.7573 17.3333L14 8.68665L17.2427 17.3333H10.7573Z" fill="currentColor"></path></svg></div></div> <span>Lesbare Schrift</span>`;
				t41 = space();
				button8 = element("button");
				div26 = element("div");
				div25 = element("div");
				div25.innerHTML = `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="Edit / Text"><path id="Vector" d="M10 19H12M12 19H14M12 19V5M12 5H6V6M12 5H18V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></g></svg>`;
				t42 = space();
				span11 = element("span");
				span11.textContent = "Titel hervorheben";
				t44 = space();
				button9 = element("button");
				div28 = element("div");
				div27 = element("div");
				div27.innerHTML = `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="Interface / Link_Horizontal"><path id="Vector" d="M8 12H16M15 8H17C19.2091 8 21 9.79086 21 12C21 14.2091 19.2091 16 17 16H15M9 8H7C4.79086 8 3 9.79086 3 12C3 14.2091 4.79086 16 7 16H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></g></svg>`;
				t45 = space();
				span12 = element("span");
				span12.textContent = "Links hervorheben";
				t47 = space();
				button10 = element("button");
				button10.innerHTML = `<div class="accessi_widget-vertical-left center svelte-1q83lbh"><div class="embed-svg btn svelte-1q83lbh"><svg width="100%" height="100%" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 25.3334V11.3334C4 10.0957 4.49167 8.90869 5.36684 8.03352C6.24201 7.15835 7.42899 6.66669 8.66667 6.66669C9.90434 6.66669 11.0913 7.15835 11.9665 8.03352C12.8417 8.90869 13.3333 10.0957 13.3333 11.3334V25.3334M4 17.3334H13.3333M28 16V25.3334M18.6667 20.6667C18.6667 21.9044 19.1583 23.0914 20.0335 23.9665C20.9087 24.8417 22.0957 25.3334 23.3333 25.3334C24.571 25.3334 25.758 24.8417 26.6332 23.9665C27.5083 23.0914 28 21.9044 28 20.6667C28 19.429 27.5083 18.242 26.6332 17.3669C25.758 16.4917 24.571 16 23.3333 16C22.0957 16 20.9087 16.4917 20.0335 17.3669C19.1583 18.242 18.6667 19.429 18.6667 20.6667Z" stroke="currentColor" stroke-width="2.66667" stroke-linecap="round" stroke-linejoin="round"></path></svg></div></div> <span>Titlecase</span>`;
				t50 = space();
				div35 = element("div");
				div33 = element("div");
				div33.innerHTML = `<div class="accessi_widget-vertical-left center svelte-1q83lbh"><div class="embed-svg btn svelte-1q83lbh"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="Arrow / Expand"><path id="Vector" d="M10 19H5V14M14 5H19V10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></g></svg></div></div> <span>Schriftgröße</span>`;
				t53 = space();
				div34 = element("div");
				button11 = element("button");
				button11.innerHTML = `<span>1x</span>`;
				t55 = space();
				button12 = element("button");
				button12.innerHTML = `<span>1.5x</span>`;
				t57 = space();
				button13 = element("button");
				button13.innerHTML = `<span>2x</span>`;
				t59 = space();
				button14 = element("button");
				button14.innerHTML = `<span>2.5x</span>`;
				t61 = space();
				button15 = element("button");
				button15.innerHTML = `<div class="accessi_widget-vertical-left center svelte-1q83lbh"><div class="embed-svg btn svelte-1q83lbh"><svg width="100%" height="100%" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 25.3334V11.3334C4 10.0957 4.49167 8.90869 5.36684 8.03352C6.24201 7.15835 7.42899 6.66669 8.66667 6.66669C9.90434 6.66669 11.0913 7.15835 11.9665 8.03352C12.8417 8.90869 13.3333 10.0957 13.3333 11.3334V25.3334M4 17.3334H13.3333M18.6667 25.3334V11.3334C18.6667 10.0957 19.1583 8.90869 20.0335 8.03352C20.9087 7.15835 22.0957 6.66669 23.3333 6.66669C24.571 6.66669 25.758 7.15835 26.6332 8.03352C27.5083 8.90869 28 10.0957 28 11.3334V25.3334M18.6667 17.3334H28" stroke="currentColor" stroke-width="2.66667" stroke-linecap="round" stroke-linejoin="round"></path></svg></div></div> <span>Großbuchstaben</span>`;
				t64 = space();
				div42 = element("div");
				div40 = element("div");
				div40.innerHTML = `<div class="accessi_widget-vertical-left center svelte-1q83lbh"><div class="embed-svg btn svelte-1q83lbh"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="Edit / Move_Vertical"><path id="Vector" d="M12 21V3M12 21L15 18M12 21L9 18M12 3L9 6M12 3L15 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></g></svg></div></div> <span>Zeilenhöhe</span>`;
				t67 = space();
				div41 = element("div");
				button16 = element("button");
				button16.innerHTML = `<span>1x</span>`;
				t69 = space();
				button17 = element("button");
				button17.innerHTML = `<span>1.5x</span>`;
				t71 = space();
				button18 = element("button");
				button18.innerHTML = `<span>2x</span>`;
				t73 = space();
				button19 = element("button");
				button19.innerHTML = `<span>2.5x</span>`;
				t75 = space();
				button20 = element("button");
				button20.innerHTML = `<div class="accessi_widget-vertical-left center svelte-1q83lbh"><div class="embed-svg btn svelte-1q83lbh"><svg width="100%" height="100%" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.3333 16V25.3333M28 16V25.3333M4 20.6667C4 21.2795 4.12071 21.8863 4.35523 22.4525C4.58975 23.0187 4.9335 23.5332 5.36684 23.9665C5.80018 24.3998 6.31462 24.7436 6.88081 24.9781C7.447 25.2126 8.05383 25.3333 8.66667 25.3333C9.2795 25.3333 9.88634 25.2126 10.4525 24.9781C11.0187 24.7436 11.5332 24.3998 11.9665 23.9665C12.3998 23.5332 12.7436 23.0187 12.9781 22.4525C13.2126 21.8863 13.3333 21.2795 13.3333 20.6667C13.3333 20.0538 13.2126 19.447 12.9781 18.8808C12.7436 18.3146 12.3998 17.8002 11.9665 17.3668C11.5332 16.9335 11.0187 16.5898 10.4525 16.3552C9.88634 16.1207 9.2795 16 8.66667 16C8.05383 16 7.447 16.1207 6.88081 16.3552C6.31462 16.5898 5.80018 16.9335 5.36684 17.3668C4.9335 17.8002 4.58975 18.3146 4.35523 18.8808C4.12071 19.447 4 20.0538 4 20.6667ZM18.6667 20.6667C18.6667 21.9043 19.1583 23.0913 20.0335 23.9665C20.9087 24.8417 22.0957 25.3333 23.3333 25.3333C24.571 25.3333 25.758 24.8417 26.6332 23.9665C27.5083 23.0913 28 21.9043 28 20.6667C28 19.429 27.5083 18.242 26.6332 17.3668C25.758 16.4917 24.571 16 23.3333 16C22.0957 16 20.9087 16.4917 20.0335 17.3668C19.1583 18.242 18.6667 19.429 18.6667 20.6667Z" stroke="currentColor" stroke-width="2.66667" stroke-linecap="round" stroke-linejoin="round"></path></svg></div></div> <span>Kleinbuchstaben</span>`;
				t78 = space();
				div49 = element("div");
				div47 = element("div");
				div47.innerHTML = `<div class="accessi_widget-vertical-left center svelte-1q83lbh"><div class="embed-svg btn svelte-1q83lbh"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="Edit / Move_Horizontal"><path id="Vector" d="M3 12H21M3 12L6 15M3 12L6 9M21 12L18 9M21 12L18 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></g></svg></div></div> <span>Buchstabenabstand</span>`;
				t81 = space();
				div48 = element("div");
				button21 = element("button");
				button21.innerHTML = `<span>1x</span>`;
				t83 = space();
				button22 = element("button");
				button22.innerHTML = `<span>1.5x</span>`;
				t85 = space();
				button23 = element("button");
				button23.innerHTML = `<span>2x</span>`;
				t87 = space();
				button24 = element("button");
				button24.innerHTML = `<span>2.5x</span>`;
				t89 = space();
				button25 = element("button");
				button25.innerHTML = `<div class="accessi_widget-vertical-left center svelte-1q83lbh"><div class="embed-svg btn svelte-1q83lbh"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="Edit / Text_Align_Left"><path id="Vector" d="M4 18H14M4 14H20M4 10H14M4 6H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></g></svg></div></div> <span>Text Links</span>`;
				t92 = space();
				button26 = element("button");
				button26.innerHTML = `<div class="accessi_widget-vertical-left center svelte-1q83lbh"><div class="embed-svg btn svelte-1q83lbh"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="Edit / Text_Align_Justify"><path id="Vector" d="M20 18H4M20 14H4M20 10H4M20 6H4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></g></svg></div></div> <span>Text Zentriert</span>`;
				t95 = space();
				button27 = element("button");
				button27.innerHTML = `<div class="accessi_widget-vertical-left center svelte-1q83lbh"><div class="embed-svg btn svelte-1q83lbh"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="Edit / Text_Align_Right"><path id="Vector" d="M20 18H10M20 14H4M20 10H10M20 6H4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></g></svg></div></div> <span>Text Rechts</span>`;
				t98 = space();
				div98 = element("div");
				span34 = element("span");
				span34.textContent = "Wählen Sie das richtige Zugänglichkeitsprofil";
				t100 = space();
				div58 = element("div");
				t101 = space();
				div97 = element("div");
				button28 = element("button");
				button28.innerHTML = `<div class="accessi_widget-vertical-left center svelte-1q83lbh"><div class="embed-svg btn svelte-1q83lbh"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="Arrow / Arrow_Left_Right"><path id="Vector" d="M16 13L19 16M19 16L16 19M19 16H5M8 11L5 8M5 8L8 5M5 8H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></g></svg></div></div> <span>Farbe umkehren</span>`;
				t104 = space();
				button29 = element("button");
				button29.innerHTML = `<div class="accessi_widget-vertical-left center svelte-1q83lbh"><div class="embed-svg btn svelte-1q83lbh"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="Environment / Moon"><path id="Vector" d="M9 6C9 10.9706 13.0294 15 18 15C18.9093 15 19.787 14.8655 20.6144 14.6147C19.4943 18.3103 16.0613 20.9999 12 20.9999C7.02944 20.9999 3 16.9707 3 12.0001C3 7.93883 5.69007 4.50583 9.38561 3.38574C9.13484 4.21311 9 5.09074 9 6Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></g></svg></div></div> <span>Dunkler Kontrast</span>`;
				t107 = space();
				button30 = element("button");
				button30.innerHTML = `<div class="accessi_widget-vertical-left center svelte-1q83lbh"><div class="embed-svg btn svelte-1q83lbh"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="Environment / Sun"><path id="Vector" d="M12 4V2M12 20V22M6.41421 6.41421L5 5M17.728 17.728L19.1422 19.1422M4 12H2M20 12H22M17.7285 6.41421L19.1427 5M6.4147 17.728L5.00049 19.1422M12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12C17 14.7614 14.7614 17 12 17Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></g></svg></div></div> <span>Heller Kontrast</span>`;
				t110 = space();
				button31 = element("button");
				button31.innerHTML = `<div class="accessi_widget-vertical-left center svelte-1q83lbh"><div class="embed-svg btn svelte-1q83lbh"><svg width="100%" height="100%" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 6.41335V25.3334C11.5867 25.3334 8.00001 21.8267 8.00001 17.5067C8.00001 15.4267 8.82668 13.4667 10.3333 11.9867L16 6.41335ZM16 2.66669L8.46668 10.08C6.53334 11.9867 5.33334 14.6134 5.33334 17.5067C5.33334 23.3067 10.1067 28 16 28C21.8933 28 26.6667 23.3067 26.6667 17.5067C26.6667 14.6134 25.4667 11.9867 23.5333 10.08L16 2.66669Z" fill="currentColor"></path></svg></div></div> <span>Hohe Sättigung</span>`;
				t113 = space();
				div72 = element("div");
				div69 = element("div");
				div69.innerHTML = `<div class="accessi_widget-vertical-left center svelte-1q83lbh"><div class="embed-svg btn svelte-1q83lbh"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="Edit / Show"><g id="Vector"><path d="M3.5868 13.7788C5.36623 15.5478 8.46953 17.9999 12.0002 17.9999C15.5308 17.9999 18.6335 15.5478 20.413 13.7788C20.8823 13.3123 21.1177 13.0782 21.2671 12.6201C21.3738 12.2933 21.3738 11.7067 21.2671 11.3799C21.1177 10.9218 20.8823 10.6877 20.413 10.2211C18.6335 8.45208 15.5308 6 12.0002 6C8.46953 6 5.36623 8.45208 3.5868 10.2211C3.11714 10.688 2.88229 10.9216 2.7328 11.3799C2.62618 11.7067 2.62618 12.2933 2.7328 12.6201C2.88229 13.0784 3.11714 13.3119 3.5868 13.7788Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M10 12C10 13.1046 10.8954 14 12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></g></g></svg></div></div> <span>Hintergrundfarbe</span>`;
				t116 = space();
				div70 = element("div");
				button32 = element("button");
				t117 = space();
				button33 = element("button");
				t118 = space();
				button34 = element("button");
				t119 = space();
				button35 = element("button");
				t120 = space();
				button36 = element("button");
				t121 = space();
				button37 = element("button");
				t122 = space();
				div71 = element("div");
				button38 = element("button");
				button38.textContent = "Reset";
				t124 = space();
				button39 = element("button");
				button39.innerHTML = `<div class="accessi_widget-vertical-left center svelte-1q83lbh"><div class="embed-svg btn svelte-1q83lbh"><svg width="100%" height="100%" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path opacity="0.3" d="M10.3333 11.9867C9.59489 12.7039 9.00788 13.562 8.60708 14.5101C8.20628 15.4583 7.99985 16.4773 8 17.5067C8 21.8267 11.5867 25.3333 16 25.3333V6.41333L10.3333 11.9867Z" fill="currentColor"></path><path d="M23.5333 10.08L16 2.66663L8.46668 10.08C6.53334 11.9866 5.33334 14.6133 5.33334 17.5066C5.33334 23.3066 10.1067 28 16 28C21.8933 28 26.6667 23.3066 26.6667 17.5066C26.6667 14.6133 25.4667 11.9866 23.5333 10.08ZM8.00001 17.5066C8.00001 15.4266 8.82668 13.4666 10.3333 11.9866L16 6.41329V25.3333C11.5867 25.3333 8.00001 21.8266 8.00001 17.5066Z" fill="currentColor"></path></svg></div></div> <span>Niedrige Sättigung</span>`;
				t127 = space();
				div80 = element("div");
				div77 = element("div");
				div77.innerHTML = `<div class="accessi_widget-vertical-left center svelte-1q83lbh"><div class="embed-svg btn svelte-1q83lbh"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="Arrow / Expand"><path id="Vector" d="M10 19H5V14M14 5H19V10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></g></svg></div></div> <span>Titelfarbe</span>`;
				t130 = space();
				div78 = element("div");
				button40 = element("button");
				t131 = space();
				button41 = element("button");
				t132 = space();
				button42 = element("button");
				t133 = space();
				button43 = element("button");
				t134 = space();
				button44 = element("button");
				t135 = space();
				button45 = element("button");
				t136 = space();
				div79 = element("div");
				button46 = element("button");
				button46.textContent = "Reset";
				t138 = space();
				button47 = element("button");
				button47.innerHTML = `<div class="accessi_widget-vertical-left center svelte-1q83lbh"><div class="embed-svg btn svelte-1q83lbh"><svg width="100%" height="100%" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M23.5333 10.08L16 2.66669L8.46665 10.08C6.53331 11.9867 5.33331 14.6134 5.33331 17.5067C5.33331 23.3067 10.1066 28 16 28C21.8933 28 26.6666 23.3067 26.6666 17.5067C26.6666 14.6134 25.4666 11.9867 23.5333 10.08Z" fill="currentColor"></path></svg></div></div> <span>Entsättigt</span>`;
				t141 = space();
				div88 = element("div");
				div85 = element("div");
				div85.innerHTML = `<div class="accessi_widget-vertical-left center svelte-1q83lbh"><div class="embed-svg btn svelte-1q83lbh"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="Arrow / Expand"><path id="Vector" d="M10 19H5V14M14 5H19V10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></g></svg></div></div> <span>Textfarbe</span>`;
				t144 = space();
				div86 = element("div");
				button48 = element("button");
				t145 = space();
				button49 = element("button");
				t146 = space();
				button50 = element("button");
				t147 = space();
				button51 = element("button");
				t148 = space();
				button52 = element("button");
				t149 = space();
				button53 = element("button");
				t150 = space();
				div87 = element("div");
				button54 = element("button");
				button54.textContent = "Reset";
				t152 = space();
				button55 = element("button");
				button55.innerHTML = `<div class="accessi_widget-vertical-left center svelte-1q83lbh"><div class="embed-svg btn svelte-1q83lbh"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="Edit / Font"><path id="Vector" d="M13 18L8 6L3 18M11 14H5M21 18V15M21 15V12M21 15C21 16.6569 19.6569 18 18 18C16.3431 18 15 16.6569 15 15C15 13.3431 16.3431 12 18 12C19.6569 12 21 13.3431 21 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></g></svg></div></div> <span>Lesbare Schrift</span>`;
				t155 = space();
				div96 = element("div");
				div93 = element("div");
				div93.innerHTML = `<div class="accessi_widget-vertical-left center svelte-1q83lbh"><div class="embed-svg btn svelte-1q83lbh"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="Arrow / Expand"><path id="Vector" d="M10 19H5V14M14 5H19V10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></g></svg></div></div> <span>Linkfarbe</span>`;
				t158 = space();
				div94 = element("div");
				button56 = element("button");
				t159 = space();
				button57 = element("button");
				t160 = space();
				button58 = element("button");
				t161 = space();
				button59 = element("button");
				t162 = space();
				button60 = element("button");
				t163 = space();
				button61 = element("button");
				t164 = space();
				div95 = element("div");
				button62 = element("button");
				button62.textContent = "Reset";
				t166 = space();
				div125 = element("div");
				span46 = element("span");
				span46.textContent = "Wählen Sie das richtige Zugänglichkeitsprofil";
				t168 = space();
				div99 = element("div");
				t169 = space();
				div124 = element("div");
				button63 = element("button");
				button63.innerHTML = `<div class="accessi_widget-vertical-left center svelte-1q83lbh"><div class="embed-svg btn svelte-1q83lbh"><svg width="100%" height="100%" viewBox="0 0 27 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.33412 4.289C9.54468 4.10389 9.82886 4.00005 10.125 4H16.875C17.1734 4 17.4595 4.10536 17.6705 4.29289C17.8815 4.48043 18 4.73478 18 5C18 5.53043 18.2371 6.03914 18.659 6.41421C19.081 6.78929 19.6533 7 20.25 7H21.375C21.9717 7 22.544 7.21071 22.966 7.58579C23.3879 7.96086 23.625 8.46957 23.625 9V17M22.2896 19.828C22.0095 19.938 21.7001 20 21.375 20H5.625C5.02826 20 4.45597 19.7893 4.03401 19.4142C3.61205 19.0391 3.375 18.5304 3.375 18V9C3.375 8.46957 3.61205 7.96086 4.03401 7.58579C4.45597 7.21071 5.02826 7 5.625 7H6.75C7.08525 7 7.4025 6.935 7.68825 6.819" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M11.7247 10.448C11.2907 10.6871 10.9234 11.0106 10.6504 11.3941C10.3773 11.7777 10.2058 12.2113 10.1486 12.6623C10.0915 13.1133 10.1502 13.57 10.3204 13.9979C10.4905 14.4258 10.7677 14.8139 11.131 15.1328C11.4944 15.4517 11.9344 15.6931 12.4179 15.839C12.9014 15.9848 13.4159 16.0313 13.9225 15.9748C14.4291 15.9183 14.9147 15.7604 15.3428 15.5129C15.7708 15.2654 16.13 14.9348 16.3935 14.546M3.375 3L23.625 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg></div></div> <span>Bilder ausblenden</span>`;
				t172 = space();
				button64 = element("button");
				button64.innerHTML = `<div class="accessi_widget-vertical-left center svelte-1q83lbh"><div class="embed-svg btn svelte-1q83lbh"><svg width="100%" height="100%" viewBox="0 0 36 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M27 9.33333C27 7.86267 25.6545 6.66667 24 6.66667H9.621L5.5605 3.05733L3.4395 4.94267L30.4395 28.9427L32.5605 27.0573L27 22.1147V18.2227L33 22.6667V9.33333L27 13.7773V9.33333ZM24 19.448L12.621 9.33333H24V19.448ZM6 25.3333H22.3185L19.3185 22.6667H6V10.828L3.2175 8.35333C3.0762 8.66491 3.00241 8.9974 3 9.33333V22.6667C3 24.1373 4.3455 25.3333 6 25.3333Z" fill="currentColor"></path></svg></div></div> <span>Videos ausblenden</span>`;
				t175 = space();
				button65 = element("button");
				button65.innerHTML = `<div class="accessi_widget-vertical-left center svelte-1q83lbh"><div class="embed-svg btn svelte-1q83lbh"><svg width="100%" height="100%" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_1_6)"><path d="M29.0533 24L31.72 26.6667H32V24H29.0533ZM1.48 3.97333L3.54667 6.05333C3 6.54667 2.66667 7.24 2.66667 8.02667V21.3333C2.66667 22.8 3.86667 24 5.34667 24H0V26.6667H24.1733L27.7867 30.28L29.6667 28.4L3.36 2.09333L1.48 3.97333ZM5.33333 8.02667H5.50667L12.1067 14.6C10.5867 16.0933 9.74667 18.0267 9.33333 20C10.6133 18.28 12.1733 17.2267 14.2267 16.72L18.84 21.36H5.33333V8.02667ZM26.6667 8.02667V21.6133L28.4 23.3467C28.96 22.8533 29.3333 22.16 29.3333 21.36V8.02667C29.3333 7.31942 29.0524 6.64115 28.5523 6.14105C28.0522 5.64095 27.3739 5.36 26.6667 5.36H10.4L13.0667 8.02667H26.6667ZM17.24 12.2L20.96 15.9067L22.6667 14.3067L17.3333 9.33333V12.1733L17.24 12.2Z" fill="currentColor"></path></g><defs><clipPath id="clip0_1_6"><rect width="100%" height="100%" fill="currentColor"></rect></clipPath></defs></svg></div></div> <span>Animationen deaktivieren</span>`;
				t178 = space();
				button66 = element("button");
				button66.innerHTML = `<div class="accessi_widget-vertical-left center svelte-1q83lbh"><div class="embed-svg btn svelte-1q83lbh"><svg width="100%" height="100%" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M220.49 207.8L207.8 220.49C206.685 221.609 205.36 222.496 203.902 223.102C202.443 223.708 200.879 224.019 199.3 224.019C197.721 224.019 196.157 223.708 194.698 223.102C193.24 222.496 191.915 221.609 190.8 220.49L134.23 163.92L115 214.08L114.87 214.41C113.644 217.265 111.605 219.697 109.007 221.402C106.409 223.107 103.367 224.011 100.26 224H99.48C96.2403 223.864 93.1205 222.736 90.5431 220.769C87.9657 218.801 86.0551 216.089 85.07 213L32.8 52.92C31.8832 50.1189 31.7605 47.1185 32.4455 44.2519C33.1305 41.3853 34.5964 38.7645 36.6804 36.6804C38.7645 34.5964 41.3853 33.1305 44.2519 32.4455C47.1185 31.7605 50.1189 31.8832 52.92 32.8L213 85.07C216.059 86.0935 218.738 88.0179 220.684 90.5908C222.631 93.1637 223.754 96.2648 223.906 99.4873C224.059 102.71 223.234 105.903 221.539 108.648C219.844 111.393 217.359 113.562 214.41 114.87L214.08 115L163.92 134.27L220.49 190.83C222.74 193.08 224.004 196.133 224.004 199.315C224.004 202.497 222.74 205.55 220.49 207.8Z" fill="currentColor"></path></svg></div></div> <span>Zeiger einblenden</span>`;
				t181 = space();
				div112 = element("div");
				div110 = element("div");
				div110.innerHTML = `<div class="accessi_widget-vertical-left center svelte-1q83lbh"><div class="embed-svg btn svelte-1q83lbh"><svg width="100%" height="100%" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.5387 23.4173C10.6096 23.7359 10.7762 24.0251 11.0162 24.2463C11.2562 24.4675 11.5581 24.6099 11.8813 24.6546C12.2046 24.6993 12.5338 24.6441 12.8248 24.4963C13.1158 24.3486 13.3547 24.1154 13.5093 23.828L16.296 19.704L22.8387 26.2467C22.9708 26.3788 23.1276 26.4836 23.3002 26.5551C23.4728 26.6266 23.6578 26.6634 23.8447 26.6634C24.0315 26.6634 24.2165 26.6266 24.3891 26.5551C24.5617 26.4836 24.7186 26.3788 24.8507 26.2467L26.2467 24.8507C26.3788 24.7186 26.4836 24.5617 26.5551 24.3891C26.6266 24.2165 26.6634 24.0315 26.6634 23.8447C26.6634 23.6578 26.6266 23.4728 26.5551 23.3002C26.4836 23.1276 26.3788 22.9708 26.2467 22.8387L19.704 16.296L23.8547 13.5093C24.142 13.3546 24.3752 13.1156 24.5229 12.8245C24.6705 12.5334 24.7256 12.2042 24.6808 11.8809C24.636 11.5576 24.4933 11.2557 24.272 11.0158C24.0507 10.7759 23.7613 10.6094 23.4427 10.5387L5.33334 5.33333L10.5387 23.4173Z" stroke="currentColor" stroke-width="2.66667" stroke-linecap="round" stroke-linejoin="round"></path></svg></div></div> <span>Zeigergröße</span>`;
				t184 = space();
				div111 = element("div");
				button67 = element("button");
				button67.innerHTML = `<span>1x</span>`;
				t186 = space();
				button68 = element("button");
				button68.innerHTML = `<span>1.5x</span>`;
				t188 = space();
				button69 = element("button");
				button69.innerHTML = `<span>2x</span>`;
				t190 = space();
				button70 = element("button");
				button70.innerHTML = `<span>2.5x</span>`;
				t192 = space();
				button71 = element("button");
				button71.innerHTML = `<div class="accessi_widget-vertical-left center svelte-1q83lbh"><div class="embed-svg btn svelte-1q83lbh"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="Media / Volume_Off"><path id="Vector" d="M16.1716 9.17117L21.8284 14.828M16.1716 14.828L21.8284 9.17117M7.4803 15.4065L9.15553 17.4796C10.0288 18.5603 10.4655 19.1006 10.848 19.1594C11.1792 19.2104 11.5138 19.092 11.7394 18.8443C12 18.5581 12 17.8634 12 16.4739V7.52526C12 6.13581 12 5.44109 11.7394 5.1549C11.5138 4.90715 11.1792 4.78884 10.848 4.83975C10.4655 4.89858 10.0288 5.43893 9.15553 6.51963L7.4803 8.59273C7.30388 8.81105 7.21567 8.92021 7.10652 8.99876C7.00982 9.06835 6.90147 9.1201 6.78656 9.15158C6.65687 9.1871 6.51652 9.1871 6.23583 9.1871H4.8125C4.0563 9.1871 3.6782 9.1871 3.37264 9.28804C2.77131 9.4867 2.2996 9.95841 2.10094 10.5597C2 10.8653 2 11.2434 2 11.9996C2 12.7558 2 13.1339 2.10094 13.4395C2.2996 14.0408 2.77131 14.5125 3.37264 14.7112C3.6782 14.8121 4.0563 14.8121 4.8125 14.8121H6.23583C6.51652 14.8121 6.65687 14.8121 6.78656 14.8476C6.90147 14.8791 7.00982 14.9308 7.10652 15.0004C7.21567 15.079 7.30388 15.1881 7.4803 15.4065Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></g></svg></div></div> <span>Audio deaktivieren</span>`;
				t195 = space();
				div119 = element("div");
				div117 = element("div");
				div117.innerHTML = `<div class="accessi_widget-vertical-left center svelte-1q83lbh"><div class="embed-svg btn svelte-1q83lbh"><svg width="100%" height="100%" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M26.004 13.2933C27.6093 13.9453 27.4867 16.2587 25.8213 16.7373L17.4147 19.1547L13.5747 27.0147C12.8133 28.572 10.5133 28.2907 10.1493 26.596L6.236 8.34267C6.16607 8.01822 6.18592 7.68085 6.29342 7.36684C6.40092 7.05284 6.592 6.77409 6.8461 6.56057C7.10021 6.34706 7.40771 6.20687 7.73555 6.15509C8.06338 6.1033 8.39913 6.14188 8.70667 6.26667L26.004 13.2933Z" fill="#D9D9D9" stroke="currentColor" stroke-width="2"></path></svg></div></div> <span>Zeigerfarbe</span>`;
				t198 = space();
				div118 = element("div");
				button72 = element("button");
				t199 = space();
				button73 = element("button");
				t200 = space();
				button74 = element("button");
				t201 = space();
				button75 = element("button");
				t202 = space();
				button76 = element("button");
				t203 = space();
				button77 = element("button");
				t204 = space();
				button78 = element("button");
				button78.innerHTML = `<div class="accessi_widget-vertical-left center svelte-1q83lbh"><div class="embed-svg btn svelte-1q83lbh"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="Edit / Rows"><g id="Vector"><path d="M6.5 19H17.5C17.9647 19 18.197 18.9999 18.3902 18.9614C19.1836 18.8036 19.8036 18.1836 19.9614 17.3902C19.9999 17.197 19.9999 16.9647 19.9999 16.5C19.9999 16.0353 19.9999 15.8031 19.9614 15.6099C19.8036 14.8165 19.1836 14.1962 18.3902 14.0384C18.197 14 17.9647 14 17.5 14H6.5C6.03534 14 5.80306 14 5.60986 14.0384C4.81648 14.1962 4.19624 14.8165 4.03843 15.6099C4 15.8031 4 16.0354 4 16.5C4 16.9647 4 17.1969 4.03843 17.3901C4.19624 18.1835 4.81648 18.8036 5.60986 18.9614C5.80306 18.9999 6.03535 19 6.5 19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></g></g></svg></div></div> <span>Lesehilfe</span>`;
				t207 = space();
				button79 = element("button");
				button79.innerHTML = `<div class="accessi_widget-vertical-left center svelte-1q83lbh"><div class="embed-svg btn svelte-1q83lbh"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="Edit / Font"><path id="Vector" d="M13 18L8 6L3 18M11 14H5M21 18V15M21 15V12M21 15C21 16.6569 19.6569 18 18 18C16.3431 18 15 16.6569 15 15C15 13.3431 16.3431 12 18 12C19.6569 12 21 13.3431 21 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></g></svg></div></div> <span>Lesemodus</span>`;
				t210 = space();
				if (if_block1) if_block1.c();
				attr(div0, "class", "accessi_widget-gradient svelte-1q83lbh");
				attr(div3, "class", "accessi_language-wrapper svelte-1q83lbh");
				attr(button0, "data-accessi-none", "");
				attr(button0, "class", "accessi_close svelte-1q83lbh");
				attr(div4, "class", "accessi_top-bar svelte-1q83lbh");
				attr(div5, "class", "spacer-small svelte-1q83lbh");
				attr(div6, "class", "max-width-medium svelte-1q83lbh");
				attr(button1, "data-accessi-none", "");
				attr(button1, "class", "accessi_action-button svelte-1q83lbh");
				attr(button2, "data-accessi-none", "");
				attr(button2, "class", "accessi_action-button svelte-1q83lbh");
				attr(div9, "class", "accessi_action-button-wraper svelte-1q83lbh");
				attr(div10, "class", "accessi_hero-header svelte-1q83lbh");
				attr(div11, "class", "spacer-large svelte-1q83lbh");
				attr(span4, "class", "accessi_heading svelte-1q83lbh");
				attr(span4, "data-accessi-none", "");
				attr(div12, "class", "spacer-small svelte-1q83lbh");
				attr(div13, "class", "embed-svg profiles svelte-1q83lbh");
				toggle_class(div13, "pressed", /*profileBlind*/ ctx[2]);
				attr(button3, "data-accessi-none", "");
				attr(button3, "class", "accessi_widget-vertical-item svelte-1q83lbh");
				toggle_class(button3, "pressed", /*profileBlind*/ ctx[2]);
				attr(button4, "data-accessi-none", "");
				attr(button4, "class", "accessi_widget-vertical-item svelte-1q83lbh");
				attr(button5, "data-accessi-none", "");
				attr(button5, "class", "accessi_widget-vertical-item svelte-1q83lbh");
				attr(button6, "data-accessi-none", "");
				attr(button6, "class", "accessi_widget-vertical-item svelte-1q83lbh");
				attr(div20, "class", "accessi_widget-vertical-wrapper svelte-1q83lbh");
				attr(div21, "class", "accessi_widget-content-item svelte-1q83lbh");
				attr(span9, "class", "accessi_heading svelte-1q83lbh");
				attr(span9, "data-accessi-none", "");
				attr(div22, "class", "spacer-small svelte-1q83lbh");
				attr(button7, "data-accessi-none", "");
				attr(button7, "class", "accessi_button-wrapper accessi_widget-vertical-item svelte-1q83lbh");
				toggle_class(button7, "pressed", /*readableFonts*/ ctx[3]);
				attr(div25, "class", "embed-svg btn underline svelte-1q83lbh");
				toggle_class(div25, "pressed", /*highlightTitles*/ ctx[4]);
				attr(div26, "class", "accessi_widget-vertical-left center svelte-1q83lbh");
				attr(button8, "data-accessi-none", "");
				attr(button8, "class", "accessi_button-wrapper accessi_widget-vertical-item svelte-1q83lbh");
				toggle_class(button8, "pressed", /*highlightTitles*/ ctx[4]);
				attr(div27, "class", "embed-svg btn underline svelte-1q83lbh");
				toggle_class(div27, "pressed", /*highlightLinks*/ ctx[5]);
				attr(div28, "class", "accessi_widget-vertical-left center svelte-1q83lbh");
				attr(button9, "data-accessi-none", "");
				attr(button9, "class", "accessi_button-wrapper accessi_widget-vertical-item svelte-1q83lbh");
				toggle_class(button9, "pressed", /*highlightLinks*/ ctx[5]);
				attr(button10, "data-accessi-none", "");
				attr(button10, "class", "accessi_button-wrapper accessi_widget-vertical-item svelte-1q83lbh");
				toggle_class(button10, "pressed", /*textTransformSelectedButton*/ ctx[25] === 'capitalize');
				attr(div33, "class", "accessi_horizontal svelte-1q83lbh");
				attr(button11, "data-accessi-none", "");
				attr(button11, "class", "accessi_num-button svelte-1q83lbh");
				toggle_class(button11, "pressed", /*fontScaleSelectedButton*/ ctx[7] === '1x');
				attr(button12, "data-accessi-none", "");
				attr(button12, "class", "accessi_num-button svelte-1q83lbh");
				toggle_class(button12, "pressed", /*fontScaleSelectedButton*/ ctx[7] === '1.5x');
				attr(button13, "data-accessi-none", "");
				attr(button13, "class", "accessi_num-button svelte-1q83lbh");
				toggle_class(button13, "pressed", /*fontScaleSelectedButton*/ ctx[7] === '2x');
				attr(button14, "data-accessi-none", "");
				attr(button14, "class", "accessi_num-button svelte-1q83lbh");
				toggle_class(button14, "pressed", /*fontScaleSelectedButton*/ ctx[7] === '2.5x');
				attr(div34, "class", "accessi_num-wrapper svelte-1q83lbh");
				attr(div35, "class", "accessi_button-wrapper accessi_widget-vertical-item full-width svelte-1q83lbh");
				attr(button15, "data-accessi-none", "");
				attr(button15, "class", "accessi_button-wrapper accessi_widget-vertical-item svelte-1q83lbh");
				toggle_class(button15, "pressed", /*textTransformSelectedButton*/ ctx[25] === 'uppercase');
				attr(div40, "class", "accessi_horizontal svelte-1q83lbh");
				attr(button16, "data-accessi-none", "");
				attr(button16, "class", "accessi_num-button svelte-1q83lbh");
				toggle_class(button16, "pressed", /*lineHeightSelectedButton*/ ctx[6] === '1x');
				attr(button17, "data-accessi-none", "");
				attr(button17, "class", "accessi_num-button svelte-1q83lbh");
				toggle_class(button17, "pressed", /*lineHeightSelectedButton*/ ctx[6] === '1.5x');
				attr(button18, "data-accessi-none", "");
				attr(button18, "class", "accessi_num-button svelte-1q83lbh");
				toggle_class(button18, "pressed", /*lineHeightSelectedButton*/ ctx[6] === '2x');
				attr(button19, "data-accessi-none", "");
				attr(button19, "class", "accessi_num-button svelte-1q83lbh");
				toggle_class(button19, "pressed", /*lineHeightSelectedButton*/ ctx[6] === '2.5x');
				attr(div41, "class", "accessi_num-wrapper svelte-1q83lbh");
				attr(div42, "class", "accessi_button-wrapper accessi_widget-vertical-item full-width svelte-1q83lbh");
				attr(button20, "data-accessi-none", "");
				attr(button20, "class", "accessi_button-wrapper accessi_widget-vertical-item svelte-1q83lbh");
				toggle_class(button20, "pressed", /*textTransformSelectedButton*/ ctx[25] === 'lowercase');
				attr(div47, "class", "accessi_horizontal svelte-1q83lbh");
				attr(button21, "data-accessi-none", "");
				attr(button21, "class", "accessi_num-button svelte-1q83lbh");
				toggle_class(button21, "pressed", /*letterSpacingSelectedButton*/ ctx[8] === '1x');
				attr(button22, "data-accessi-none", "");
				attr(button22, "class", "accessi_num-button svelte-1q83lbh");
				toggle_class(button22, "pressed", /*letterSpacingSelectedButton*/ ctx[8] === '1.5x');
				attr(button23, "data-accessi-none", "");
				attr(button23, "class", "accessi_num-button svelte-1q83lbh");
				toggle_class(button23, "pressed", /*letterSpacingSelectedButton*/ ctx[8] === '2x');
				attr(button24, "data-accessi-none", "");
				attr(button24, "class", "accessi_num-button svelte-1q83lbh");
				toggle_class(button24, "pressed", /*letterSpacingSelectedButton*/ ctx[8] === '2.5x');
				attr(div48, "class", "accessi_num-wrapper svelte-1q83lbh");
				attr(div49, "class", "accessi_button-wrapper accessi_widget-vertical-item full-width svelte-1q83lbh");
				attr(button25, "data-accessi-none", "");
				attr(button25, "class", "accessi_button-wrapper accessi_widget-vertical-item svelte-1q83lbh");
				toggle_class(button25, "pressed", /*textAlignmentSelectedButton*/ ctx[9] === 'left');
				attr(button26, "data-accessi-none", "");
				attr(button26, "class", "accessi_button-wrapper accessi_widget-vertical-item svelte-1q83lbh");
				toggle_class(button26, "pressed", /*textAlignmentSelectedButton*/ ctx[9] === 'center');
				attr(button27, "data-accessi-none", "");
				attr(button27, "class", "accessi_button-wrapper accessi_widget-vertical-item svelte-1q83lbh");
				toggle_class(button27, "pressed", /*textAlignmentSelectedButton*/ ctx[9] === 'right');
				attr(div56, "class", "accessi_widget-vertical-wrapper _3grid svelte-1q83lbh");
				attr(div57, "class", "accessi_widget-content-item svelte-1q83lbh");
				attr(span34, "class", "accessi_heading svelte-1q83lbh");
				attr(span34, "data-accessi-none", "");
				attr(div58, "class", "spacer-small svelte-1q83lbh");
				attr(button28, "data-accessi-none", "");
				attr(button28, "class", "accessi_button-wrapper accessi_widget-vertical-item svelte-1q83lbh");
				toggle_class(button28, "pressed", /*invertColor*/ ctx[10]);
				attr(button29, "data-accessi-none", "");
				attr(button29, "class", "accessi_button-wrapper accessi_widget-vertical-item svelte-1q83lbh");
				toggle_class(button29, "pressed", /*darkContrast*/ ctx[11]);
				attr(button30, "data-accessi-none", "");
				attr(button30, "class", "accessi_button-wrapper accessi_widget-vertical-item svelte-1q83lbh");
				toggle_class(button30, "pressed", /*lightContrastVar*/ ctx[12]);
				attr(button31, "data-accessi-none", "");
				attr(button31, "class", "accessi_button-wrapper accessi_widget-vertical-item svelte-1q83lbh");
				toggle_class(button31, "pressed", /*saturationSelectedButton*/ ctx[26] === 'high');
				attr(div69, "class", "accessi_horizontal svelte-1q83lbh");
				attr(button32, "class", "accessi_color-dot blue svelte-1q83lbh");
				toggle_class(button32, "pressed", /*currentBackgroundColor*/ ctx[13] === '#282ADD');
				attr(button33, "class", "accessi_color-dot orange svelte-1q83lbh");
				toggle_class(button33, "pressed", /*currentBackgroundColor*/ ctx[13] === '#DD8428');
				attr(button34, "class", "accessi_color-dot yellow svelte-1q83lbh");
				toggle_class(button34, "pressed", /*currentBackgroundColor*/ ctx[13] === '#DDB728');
				attr(button35, "class", "accessi_color-dot turquoise svelte-1q83lbh");
				toggle_class(button35, "pressed", /*currentBackgroundColor*/ ctx[13] === '#28D8DD');
				attr(button36, "class", "accessi_color-dot white svelte-1q83lbh");
				toggle_class(button36, "pressed", /*currentBackgroundColor*/ ctx[13] === '#FFFFFF');
				attr(button37, "class", "accessi_color-dot black svelte-1q83lbh");
				toggle_class(button37, "pressed", /*currentBackgroundColor*/ ctx[13] === '#000000');
				attr(div70, "class", "accessi_color-wrapper svelte-1q83lbh");
				set_style(button38, "text-decoration", "underline");
				attr(button38, "class", "svelte-1q83lbh");
				set_style(div71, "margin-top", "-0.2rem");
				attr(div72, "class", "accessi_button-wrapper accessi_widget-vertical-item full-width svelte-1q83lbh");
				attr(button39, "data-accessi-none", "");
				attr(button39, "class", "accessi_button-wrapper accessi_widget-vertical-item svelte-1q83lbh");
				toggle_class(button39, "pressed", /*saturationSelectedButton*/ ctx[26] === 'low');
				attr(div77, "class", "accessi_horizontal svelte-1q83lbh");
				attr(button40, "class", "accessi_color-dot blue svelte-1q83lbh");
				toggle_class(button40, "pressed", /*currentHeadingColor*/ ctx[14] === '#282ADD');
				attr(button41, "class", "accessi_color-dot orange svelte-1q83lbh");
				toggle_class(button41, "pressed", /*currentHeadingColor*/ ctx[14] === '#DD8428');
				attr(button42, "class", "accessi_color-dot yellow svelte-1q83lbh");
				toggle_class(button42, "pressed", /*currentHeadingColor*/ ctx[14] === '#DDB728');
				attr(button43, "class", "accessi_color-dot turquoise svelte-1q83lbh");
				toggle_class(button43, "pressed", /*currentHeadingColor*/ ctx[14] === '#28D8DD');
				attr(button44, "class", "accessi_color-dot white svelte-1q83lbh");
				toggle_class(button44, "pressed", /*currentHeadingColor*/ ctx[14] === '#FFFFFF');
				attr(button45, "class", "accessi_color-dot black svelte-1q83lbh");
				toggle_class(button45, "pressed", /*currentHeadingColor*/ ctx[14] === '#000000');
				attr(div78, "class", "accessi_color-wrapper svelte-1q83lbh");
				set_style(button46, "text-decoration", "underline");
				attr(button46, "class", "svelte-1q83lbh");
				set_style(div79, "margin-top", "-0.2rem");
				attr(div80, "class", "accessi_button-wrapper accessi_widget-vertical-item full-width svelte-1q83lbh");
				attr(button47, "data-accessi-none", "");
				attr(button47, "class", "accessi_button-wrapper accessi_widget-vertical-item svelte-1q83lbh");
				attr(div85, "class", "accessi_horizontal svelte-1q83lbh");
				attr(button48, "class", "accessi_color-dot blue svelte-1q83lbh");
				toggle_class(button48, "pressed", /*currentTextColor*/ ctx[15] === '#282ADD');
				attr(button49, "class", "accessi_color-dot orange svelte-1q83lbh");
				toggle_class(button49, "pressed", /*currentTextColor*/ ctx[15] === '#DD8428');
				attr(button50, "class", "accessi_color-dot yellow svelte-1q83lbh");
				toggle_class(button50, "pressed", /*currentTextColor*/ ctx[15] === '#DDB728');
				attr(button51, "class", "accessi_color-dot turquoise svelte-1q83lbh");
				toggle_class(button51, "pressed", /*currentTextColor*/ ctx[15] === '#28D8DD');
				attr(button52, "class", "accessi_color-dot white svelte-1q83lbh");
				toggle_class(button52, "pressed", /*currentTextColor*/ ctx[15] === '#FFFFFF');
				attr(button53, "class", "accessi_color-dot black svelte-1q83lbh");
				toggle_class(button53, "pressed", /*currentTextColor*/ ctx[15] === '#000000');
				attr(div86, "class", "accessi_color-wrapper svelte-1q83lbh");
				set_style(button54, "text-decoration", "underline");
				attr(button54, "class", "svelte-1q83lbh");
				set_style(div87, "margin-top", "-0.2rem");
				attr(div88, "class", "accessi_button-wrapper accessi_widget-vertical-item full-width svelte-1q83lbh");
				attr(button55, "data-accessi-none", "");
				attr(button55, "class", "accessi_button-wrapper accessi_widget-vertical-item svelte-1q83lbh");
				attr(div93, "class", "accessi_horizontal svelte-1q83lbh");
				attr(button56, "class", "accessi_color-dot blue svelte-1q83lbh");
				toggle_class(button56, "pressed", /*currentLinkColor*/ ctx[16] === '#282ADD');
				attr(button57, "class", "accessi_color-dot orange svelte-1q83lbh");
				toggle_class(button57, "pressed", /*currentLinkColor*/ ctx[16] === '#DD8428');
				attr(button58, "class", "accessi_color-dot yellow svelte-1q83lbh");
				toggle_class(button58, "pressed", /*currentLinkColor*/ ctx[16] === '#DDB728');
				attr(button59, "class", "accessi_color-dot turquoise svelte-1q83lbh");
				toggle_class(button59, "pressed", /*currentLinkColor*/ ctx[16] === '#28D8DD');
				attr(button60, "class", "accessi_color-dot white svelte-1q83lbh");
				toggle_class(button60, "pressed", /*currentLinkColor*/ ctx[16] === '#FFFFFF');
				attr(button61, "class", "accessi_color-dot black svelte-1q83lbh");
				toggle_class(button61, "pressed", /*currentLinkColor*/ ctx[16] === '#000000');
				attr(div94, "class", "accessi_color-wrapper svelte-1q83lbh");
				set_style(button62, "text-decoration", "underline");
				attr(button62, "class", "svelte-1q83lbh");
				set_style(div95, "margin-top", "-0.2rem");
				attr(div96, "class", "accessi_button-wrapper accessi_widget-vertical-item full-width svelte-1q83lbh");
				attr(div97, "class", "accessi_widget-vertical-wrapper _3grid svelte-1q83lbh");
				attr(div98, "class", "accessi_widget-content-item svelte-1q83lbh");
				attr(span46, "class", "accessi_heading svelte-1q83lbh");
				attr(span46, "data-accessi-none", "");
				attr(div99, "class", "spacer-small svelte-1q83lbh");
				attr(button63, "data-accessi-none", "");
				attr(button63, "class", "accessi_button-wrapper accessi_widget-vertical-item svelte-1q83lbh");
				toggle_class(button63, "pressed", /*hideImagesVar*/ ctx[17]);
				attr(button64, "data-accessi-none", "");
				attr(button64, "class", "accessi_button-wrapper accessi_widget-vertical-item svelte-1q83lbh");
				toggle_class(button64, "pressed", /*hideVideosVar*/ ctx[18]);
				attr(button65, "data-accessi-none", "");
				attr(button65, "class", "accessi_button-wrapper accessi_widget-vertical-item svelte-1q83lbh");
				toggle_class(button65, "pressed", /*hideAnimationsVar*/ ctx[19]);
				attr(button66, "data-accessi-none", "");
				attr(button66, "class", "accessi_button-wrapper accessi_widget-vertical-item svelte-1q83lbh");
				toggle_class(button66, "pressed", /*showCustomCursor*/ ctx[22]);
				attr(div110, "class", "accessi_horizontal svelte-1q83lbh");
				attr(button67, "data-accessi-none", "");
				attr(button67, "class", "accessi_num-button svelte-1q83lbh");
				toggle_class(button67, "pressed", /*cursorSizeSelectedButton*/ ctx[21] === '1x');
				attr(button68, "data-accessi-none", "");
				attr(button68, "class", "accessi_num-button svelte-1q83lbh");
				toggle_class(button68, "pressed", /*cursorSizeSelectedButton*/ ctx[21] === '1.5x');
				attr(button69, "data-accessi-none", "");
				attr(button69, "class", "accessi_num-button svelte-1q83lbh");
				toggle_class(button69, "pressed", /*cursorSizeSelectedButton*/ ctx[21] === '2x');
				attr(button70, "data-accessi-none", "");
				attr(button70, "class", "accessi_num-button svelte-1q83lbh");
				toggle_class(button70, "pressed", /*cursorSizeSelectedButton*/ ctx[21] === '2.5x');
				attr(div111, "class", "accessi_num-wrapper svelte-1q83lbh");
				attr(div112, "class", "accessi_button-wrapper accessi_widget-vertical-item full-width svelte-1q83lbh");
				attr(button71, "data-accessi-none", "");
				attr(button71, "class", "accessi_button-wrapper accessi_widget-vertical-item svelte-1q83lbh");
				toggle_class(button71, "pressed", /*deactivateAudioVar*/ ctx[20]);
				attr(div117, "class", "accessi_horizontal svelte-1q83lbh");
				attr(button72, "class", "accessi_color-dot blue svelte-1q83lbh");
				toggle_class(button72, "pressed", /*currentCursorColor*/ ctx[23] === '#282ADD');
				attr(button73, "class", "accessi_color-dot orange svelte-1q83lbh");
				toggle_class(button73, "pressed", /*currentCursorColor*/ ctx[23] === '#DD8428');
				attr(button74, "class", "accessi_color-dot yellow svelte-1q83lbh");
				toggle_class(button74, "pressed", /*currentCursorColor*/ ctx[23] === '#DDB728');
				attr(button75, "class", "accessi_color-dot turquoise svelte-1q83lbh");
				toggle_class(button75, "pressed", /*currentCursorColor*/ ctx[23] === '#28D8DD');
				attr(button76, "class", "accessi_color-dot white svelte-1q83lbh");
				toggle_class(button76, "pressed", /*currentCursorColor*/ ctx[23] === '#FFFFFF');
				attr(button77, "class", "accessi_color-dot black svelte-1q83lbh");
				toggle_class(button77, "pressed", /*currentCursorColor*/ ctx[23] === '#000000');
				attr(div118, "class", "accessi_color-wrapper svelte-1q83lbh");
				attr(div119, "class", "accessi_button-wrapper accessi_widget-vertical-item full-width svelte-1q83lbh");
				attr(button78, "data-accessi-none", "");
				attr(button78, "class", "accessi_button-wrapper accessi_widget-vertical-item svelte-1q83lbh");
				toggle_class(button78, "pressed", /*activateReadingGuide*/ ctx[24]);
				attr(button79, "data-accessi-none", "");
				attr(button79, "class", "accessi_button-wrapper accessi_widget-vertical-item svelte-1q83lbh");
				attr(div124, "class", "accessi_widget-vertical-wrapper _3grid svelte-1q83lbh");
				attr(div125, "class", "accessi_widget-content-item svelte-1q83lbh");
				attr(div126, "class", "accessi_form-wrapper svelte-1q83lbh");
				attr(div127, "class", "accessi_widget-content-wrapper svelte-1q83lbh");
				attr(div128, "class", "accessi_widget-scroll svelte-1q83lbh");
				attr(div129, "class", "accessi_widget-menu-wrapper svelte-1q83lbh");
				attr(div129, "data-accessi-none", "");
				attr(div130, "class", "acessi_widget svelte-1q83lbh");
				attr(div131, "class", "accessi_fixed svelte-1q83lbh");
				attr(div131, "data-accessi-none", "");
				attr(div131, "data-accessi-widget", "");
			},
			m(target, anchor) {
				insert(target, div131, anchor);
				append(div131, div130);
				append(div130, div0);
				append(div130, t0);
				append(div130, div129);
				append(div129, div128);
				append(div128, div4);
				append(div4, div3);
				append(div4, t5);
				append(div4, button0);
				append(div128, t6);
				append(div128, div5);
				append(div128, t7);
				append(div128, div10);
				append(div10, div6);
				append(div10, t9);
				append(div10, div9);
				append(div9, button1);
				append(div9, t12);
				append(div9, button2);
				append(div128, t15);
				append(div128, div11);
				append(div128, t16);
				append(div128, div127);
				append(div127, form);
				append(form, div126);
				append(div126, div21);
				append(div21, span4);
				append(div21, t18);
				append(div21, div12);
				append(div21, t19);
				append(div21, div20);
				append(div20, button3);
				append(button3, div13);
				append(button3, t20);
				append(button3, span5);
				append(button3, t22);
				if (if_block0) if_block0.m(button3, null);
				append(div20, t23);
				append(div20, button4);
				append(div20, t27);
				append(div20, button5);
				append(div20, t31);
				append(div20, button6);
				append(div126, t35);
				append(div126, div57);
				append(div57, span9);
				append(div57, t37);
				append(div57, div22);
				append(div57, t38);
				append(div57, div56);
				append(div56, button7);
				append(div56, t41);
				append(div56, button8);
				append(button8, div26);
				append(div26, div25);
				append(button8, t42);
				append(button8, span11);
				append(div56, t44);
				append(div56, button9);
				append(button9, div28);
				append(div28, div27);
				append(button9, t45);
				append(button9, span12);
				append(div56, t47);
				append(div56, button10);
				append(div56, t50);
				append(div56, div35);
				append(div35, div33);
				append(div35, t53);
				append(div35, div34);
				append(div34, button11);
				append(div34, t55);
				append(div34, button12);
				append(div34, t57);
				append(div34, button13);
				append(div34, t59);
				append(div34, button14);
				append(div56, t61);
				append(div56, button15);
				append(div56, t64);
				append(div56, div42);
				append(div42, div40);
				append(div42, t67);
				append(div42, div41);
				append(div41, button16);
				append(div41, t69);
				append(div41, button17);
				append(div41, t71);
				append(div41, button18);
				append(div41, t73);
				append(div41, button19);
				append(div56, t75);
				append(div56, button20);
				append(div56, t78);
				append(div56, div49);
				append(div49, div47);
				append(div49, t81);
				append(div49, div48);
				append(div48, button21);
				append(div48, t83);
				append(div48, button22);
				append(div48, t85);
				append(div48, button23);
				append(div48, t87);
				append(div48, button24);
				append(div56, t89);
				append(div56, button25);
				append(div56, t92);
				append(div56, button26);
				append(div56, t95);
				append(div56, button27);
				append(div126, t98);
				append(div126, div98);
				append(div98, span34);
				append(div98, t100);
				append(div98, div58);
				append(div98, t101);
				append(div98, div97);
				append(div97, button28);
				append(div97, t104);
				append(div97, button29);
				append(div97, t107);
				append(div97, button30);
				append(div97, t110);
				append(div97, button31);
				append(div97, t113);
				append(div97, div72);
				append(div72, div69);
				append(div72, t116);
				append(div72, div70);
				append(div70, button32);
				append(div70, t117);
				append(div70, button33);
				append(div70, t118);
				append(div70, button34);
				append(div70, t119);
				append(div70, button35);
				append(div70, t120);
				append(div70, button36);
				append(div70, t121);
				append(div70, button37);
				append(div72, t122);
				append(div72, div71);
				append(div71, button38);
				append(div97, t124);
				append(div97, button39);
				append(div97, t127);
				append(div97, div80);
				append(div80, div77);
				append(div80, t130);
				append(div80, div78);
				append(div78, button40);
				append(div78, t131);
				append(div78, button41);
				append(div78, t132);
				append(div78, button42);
				append(div78, t133);
				append(div78, button43);
				append(div78, t134);
				append(div78, button44);
				append(div78, t135);
				append(div78, button45);
				append(div80, t136);
				append(div80, div79);
				append(div79, button46);
				append(div97, t138);
				append(div97, button47);
				append(div97, t141);
				append(div97, div88);
				append(div88, div85);
				append(div88, t144);
				append(div88, div86);
				append(div86, button48);
				append(div86, t145);
				append(div86, button49);
				append(div86, t146);
				append(div86, button50);
				append(div86, t147);
				append(div86, button51);
				append(div86, t148);
				append(div86, button52);
				append(div86, t149);
				append(div86, button53);
				append(div88, t150);
				append(div88, div87);
				append(div87, button54);
				append(div97, t152);
				append(div97, button55);
				append(div97, t155);
				append(div97, div96);
				append(div96, div93);
				append(div96, t158);
				append(div96, div94);
				append(div94, button56);
				append(div94, t159);
				append(div94, button57);
				append(div94, t160);
				append(div94, button58);
				append(div94, t161);
				append(div94, button59);
				append(div94, t162);
				append(div94, button60);
				append(div94, t163);
				append(div94, button61);
				append(div96, t164);
				append(div96, div95);
				append(div95, button62);
				append(div126, t166);
				append(div126, div125);
				append(div125, span46);
				append(div125, t168);
				append(div125, div99);
				append(div125, t169);
				append(div125, div124);
				append(div124, button63);
				append(div124, t172);
				append(div124, button64);
				append(div124, t175);
				append(div124, button65);
				append(div124, t178);
				append(div124, button66);
				append(div124, t181);
				append(div124, div112);
				append(div112, div110);
				append(div112, t184);
				append(div112, div111);
				append(div111, button67);
				append(div111, t186);
				append(div111, button68);
				append(div111, t188);
				append(div111, button69);
				append(div111, t190);
				append(div111, button70);
				append(div124, t192);
				append(div124, button71);
				append(div124, t195);
				append(div124, div119);
				append(div119, div117);
				append(div119, t198);
				append(div119, div118);
				append(div118, button72);
				append(div118, t199);
				append(div118, button73);
				append(div118, t200);
				append(div118, button74);
				append(div118, t201);
				append(div118, button75);
				append(div118, t202);
				append(div118, button76);
				append(div118, t203);
				append(div118, button77);
				append(div124, t204);
				append(div124, button78);
				append(div124, t207);
				append(div124, button79);
				append(div130, t210);
				if (if_block1) if_block1.m(div130, null);
				current = true;

				if (!mounted) {
					dispose = [
						listen(button0, "click", prevent_default(/*toggleWidget*/ ctx[27])),
						listen(button2, "click", prevent_default(/*toggleHideWidget*/ ctx[28])),
						listen(button3, "click", prevent_default(/*toggleProfileBlind*/ ctx[29])),
						listen(button7, "click", prevent_default(/*toggleReadableFonts*/ ctx[30])),
						listen(button8, "click", prevent_default(/*toggleHighlightTitles*/ ctx[31])),
						listen(button9, "click", prevent_default(/*toggleHighlightLinks*/ ctx[32])),
						listen(button10, "click", prevent_default(/*click_handler*/ ctx[54])),
						listen(button11, "click", prevent_default(/*click_handler_1*/ ctx[55])),
						listen(button12, "click", prevent_default(/*click_handler_2*/ ctx[56])),
						listen(button13, "click", prevent_default(/*click_handler_3*/ ctx[57])),
						listen(button14, "click", prevent_default(/*click_handler_4*/ ctx[58])),
						listen(button15, "click", prevent_default(/*click_handler_5*/ ctx[59])),
						listen(button16, "click", prevent_default(/*click_handler_6*/ ctx[60])),
						listen(button17, "click", prevent_default(/*click_handler_7*/ ctx[61])),
						listen(button18, "click", prevent_default(/*click_handler_8*/ ctx[62])),
						listen(button19, "click", prevent_default(/*click_handler_9*/ ctx[63])),
						listen(button20, "click", prevent_default(/*click_handler_10*/ ctx[64])),
						listen(button21, "click", prevent_default(/*click_handler_11*/ ctx[65])),
						listen(button22, "click", prevent_default(/*click_handler_12*/ ctx[66])),
						listen(button23, "click", prevent_default(/*click_handler_13*/ ctx[67])),
						listen(button24, "click", prevent_default(/*click_handler_14*/ ctx[68])),
						listen(button25, "click", prevent_default(/*click_handler_15*/ ctx[69])),
						listen(button26, "click", prevent_default(/*click_handler_16*/ ctx[70])),
						listen(button27, "click", prevent_default(/*click_handler_17*/ ctx[71])),
						listen(button28, "click", prevent_default(/*click_handler_18*/ ctx[72])),
						listen(button29, "click", prevent_default(/*click_handler_19*/ ctx[73])),
						listen(button30, "click", prevent_default(/*click_handler_20*/ ctx[74])),
						listen(button31, "click", prevent_default(/*click_handler_21*/ ctx[75])),
						listen(button32, "click", prevent_default(/*click_handler_22*/ ctx[76])),
						listen(button33, "click", prevent_default(/*click_handler_23*/ ctx[77])),
						listen(button34, "click", prevent_default(/*click_handler_24*/ ctx[78])),
						listen(button35, "click", prevent_default(/*click_handler_25*/ ctx[79])),
						listen(button36, "click", prevent_default(/*click_handler_26*/ ctx[80])),
						listen(button37, "click", prevent_default(/*click_handler_27*/ ctx[81])),
						listen(button38, "click", prevent_default(/*click_handler_28*/ ctx[82])),
						listen(button39, "click", prevent_default(/*click_handler_29*/ ctx[83])),
						listen(button40, "click", prevent_default(/*click_handler_30*/ ctx[84])),
						listen(button41, "click", prevent_default(/*click_handler_31*/ ctx[85])),
						listen(button42, "click", prevent_default(/*click_handler_32*/ ctx[86])),
						listen(button43, "click", prevent_default(/*click_handler_33*/ ctx[87])),
						listen(button44, "click", prevent_default(/*click_handler_34*/ ctx[88])),
						listen(button45, "click", prevent_default(/*click_handler_35*/ ctx[89])),
						listen(button46, "click", prevent_default(/*click_handler_36*/ ctx[90])),
						listen(button48, "click", prevent_default(/*click_handler_37*/ ctx[91])),
						listen(button49, "click", prevent_default(/*click_handler_38*/ ctx[92])),
						listen(button50, "click", prevent_default(/*click_handler_39*/ ctx[93])),
						listen(button51, "click", prevent_default(/*click_handler_40*/ ctx[94])),
						listen(button52, "click", prevent_default(/*click_handler_41*/ ctx[95])),
						listen(button53, "click", prevent_default(/*click_handler_42*/ ctx[96])),
						listen(button54, "click", prevent_default(/*click_handler_43*/ ctx[97])),
						listen(button56, "click", prevent_default(/*click_handler_44*/ ctx[98])),
						listen(button57, "click", prevent_default(/*click_handler_45*/ ctx[99])),
						listen(button58, "click", prevent_default(/*click_handler_46*/ ctx[100])),
						listen(button59, "click", prevent_default(/*click_handler_47*/ ctx[101])),
						listen(button60, "click", prevent_default(/*click_handler_48*/ ctx[102])),
						listen(button61, "click", prevent_default(/*click_handler_49*/ ctx[103])),
						listen(button62, "click", prevent_default(/*click_handler_50*/ ctx[104])),
						listen(button63, "click", prevent_default(/*click_handler_51*/ ctx[105])),
						listen(button64, "click", prevent_default(/*click_handler_52*/ ctx[106])),
						listen(button65, "click", prevent_default(/*click_handler_53*/ ctx[107])),
						listen(button66, "click", prevent_default(/*click_handler_54*/ ctx[108])),
						listen(button67, "click", prevent_default(/*click_handler_55*/ ctx[109])),
						listen(button68, "click", prevent_default(/*click_handler_56*/ ctx[110])),
						listen(button69, "click", prevent_default(/*click_handler_57*/ ctx[111])),
						listen(button70, "click", prevent_default(/*click_handler_58*/ ctx[112])),
						listen(button71, "click", prevent_default(/*click_handler_59*/ ctx[113])),
						listen(button72, "click", prevent_default(/*click_handler_60*/ ctx[114])),
						listen(button73, "click", prevent_default(/*click_handler_61*/ ctx[115])),
						listen(button74, "click", prevent_default(/*click_handler_62*/ ctx[116])),
						listen(button75, "click", prevent_default(/*click_handler_63*/ ctx[117])),
						listen(button76, "click", prevent_default(/*click_handler_64*/ ctx[118])),
						listen(button77, "click", prevent_default(/*click_handler_65*/ ctx[119])),
						listen(button78, "click", prevent_default(/*click_handler_66*/ ctx[120]))
					];

					mounted = true;
				}
			},
			p(ctx, dirty) {
				if (!current || dirty[0] & /*profileBlind*/ 4) {
					toggle_class(div13, "pressed", /*profileBlind*/ ctx[2]);
				}

				if (/*profileBlind*/ ctx[2]) {
					if (if_block0) ; else {
						if_block0 = create_if_block_3();
						if_block0.c();
						if_block0.m(button3, null);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (!current || dirty[0] & /*profileBlind*/ 4) {
					toggle_class(button3, "pressed", /*profileBlind*/ ctx[2]);
				}

				if (!current || dirty[0] & /*readableFonts*/ 8) {
					toggle_class(button7, "pressed", /*readableFonts*/ ctx[3]);
				}

				if (!current || dirty[0] & /*highlightTitles*/ 16) {
					toggle_class(div25, "pressed", /*highlightTitles*/ ctx[4]);
				}

				if (!current || dirty[0] & /*highlightTitles*/ 16) {
					toggle_class(button8, "pressed", /*highlightTitles*/ ctx[4]);
				}

				if (!current || dirty[0] & /*highlightLinks*/ 32) {
					toggle_class(div27, "pressed", /*highlightLinks*/ ctx[5]);
				}

				if (!current || dirty[0] & /*highlightLinks*/ 32) {
					toggle_class(button9, "pressed", /*highlightLinks*/ ctx[5]);
				}

				if (!current || dirty[0] & /*textTransformSelectedButton*/ 33554432) {
					toggle_class(button10, "pressed", /*textTransformSelectedButton*/ ctx[25] === 'capitalize');
				}

				if (!current || dirty[0] & /*fontScaleSelectedButton*/ 128) {
					toggle_class(button11, "pressed", /*fontScaleSelectedButton*/ ctx[7] === '1x');
				}

				if (!current || dirty[0] & /*fontScaleSelectedButton*/ 128) {
					toggle_class(button12, "pressed", /*fontScaleSelectedButton*/ ctx[7] === '1.5x');
				}

				if (!current || dirty[0] & /*fontScaleSelectedButton*/ 128) {
					toggle_class(button13, "pressed", /*fontScaleSelectedButton*/ ctx[7] === '2x');
				}

				if (!current || dirty[0] & /*fontScaleSelectedButton*/ 128) {
					toggle_class(button14, "pressed", /*fontScaleSelectedButton*/ ctx[7] === '2.5x');
				}

				if (!current || dirty[0] & /*textTransformSelectedButton*/ 33554432) {
					toggle_class(button15, "pressed", /*textTransformSelectedButton*/ ctx[25] === 'uppercase');
				}

				if (!current || dirty[0] & /*lineHeightSelectedButton*/ 64) {
					toggle_class(button16, "pressed", /*lineHeightSelectedButton*/ ctx[6] === '1x');
				}

				if (!current || dirty[0] & /*lineHeightSelectedButton*/ 64) {
					toggle_class(button17, "pressed", /*lineHeightSelectedButton*/ ctx[6] === '1.5x');
				}

				if (!current || dirty[0] & /*lineHeightSelectedButton*/ 64) {
					toggle_class(button18, "pressed", /*lineHeightSelectedButton*/ ctx[6] === '2x');
				}

				if (!current || dirty[0] & /*lineHeightSelectedButton*/ 64) {
					toggle_class(button19, "pressed", /*lineHeightSelectedButton*/ ctx[6] === '2.5x');
				}

				if (!current || dirty[0] & /*textTransformSelectedButton*/ 33554432) {
					toggle_class(button20, "pressed", /*textTransformSelectedButton*/ ctx[25] === 'lowercase');
				}

				if (!current || dirty[0] & /*letterSpacingSelectedButton*/ 256) {
					toggle_class(button21, "pressed", /*letterSpacingSelectedButton*/ ctx[8] === '1x');
				}

				if (!current || dirty[0] & /*letterSpacingSelectedButton*/ 256) {
					toggle_class(button22, "pressed", /*letterSpacingSelectedButton*/ ctx[8] === '1.5x');
				}

				if (!current || dirty[0] & /*letterSpacingSelectedButton*/ 256) {
					toggle_class(button23, "pressed", /*letterSpacingSelectedButton*/ ctx[8] === '2x');
				}

				if (!current || dirty[0] & /*letterSpacingSelectedButton*/ 256) {
					toggle_class(button24, "pressed", /*letterSpacingSelectedButton*/ ctx[8] === '2.5x');
				}

				if (!current || dirty[0] & /*textAlignmentSelectedButton*/ 512) {
					toggle_class(button25, "pressed", /*textAlignmentSelectedButton*/ ctx[9] === 'left');
				}

				if (!current || dirty[0] & /*textAlignmentSelectedButton*/ 512) {
					toggle_class(button26, "pressed", /*textAlignmentSelectedButton*/ ctx[9] === 'center');
				}

				if (!current || dirty[0] & /*textAlignmentSelectedButton*/ 512) {
					toggle_class(button27, "pressed", /*textAlignmentSelectedButton*/ ctx[9] === 'right');
				}

				if (!current || dirty[0] & /*invertColor*/ 1024) {
					toggle_class(button28, "pressed", /*invertColor*/ ctx[10]);
				}

				if (!current || dirty[0] & /*darkContrast*/ 2048) {
					toggle_class(button29, "pressed", /*darkContrast*/ ctx[11]);
				}

				if (!current || dirty[0] & /*lightContrastVar*/ 4096) {
					toggle_class(button30, "pressed", /*lightContrastVar*/ ctx[12]);
				}

				if (!current || dirty[0] & /*saturationSelectedButton*/ 67108864) {
					toggle_class(button31, "pressed", /*saturationSelectedButton*/ ctx[26] === 'high');
				}

				if (!current || dirty[0] & /*currentBackgroundColor*/ 8192) {
					toggle_class(button32, "pressed", /*currentBackgroundColor*/ ctx[13] === '#282ADD');
				}

				if (!current || dirty[0] & /*currentBackgroundColor*/ 8192) {
					toggle_class(button33, "pressed", /*currentBackgroundColor*/ ctx[13] === '#DD8428');
				}

				if (!current || dirty[0] & /*currentBackgroundColor*/ 8192) {
					toggle_class(button34, "pressed", /*currentBackgroundColor*/ ctx[13] === '#DDB728');
				}

				if (!current || dirty[0] & /*currentBackgroundColor*/ 8192) {
					toggle_class(button35, "pressed", /*currentBackgroundColor*/ ctx[13] === '#28D8DD');
				}

				if (!current || dirty[0] & /*currentBackgroundColor*/ 8192) {
					toggle_class(button36, "pressed", /*currentBackgroundColor*/ ctx[13] === '#FFFFFF');
				}

				if (!current || dirty[0] & /*currentBackgroundColor*/ 8192) {
					toggle_class(button37, "pressed", /*currentBackgroundColor*/ ctx[13] === '#000000');
				}

				if (!current || dirty[0] & /*saturationSelectedButton*/ 67108864) {
					toggle_class(button39, "pressed", /*saturationSelectedButton*/ ctx[26] === 'low');
				}

				if (!current || dirty[0] & /*currentHeadingColor*/ 16384) {
					toggle_class(button40, "pressed", /*currentHeadingColor*/ ctx[14] === '#282ADD');
				}

				if (!current || dirty[0] & /*currentHeadingColor*/ 16384) {
					toggle_class(button41, "pressed", /*currentHeadingColor*/ ctx[14] === '#DD8428');
				}

				if (!current || dirty[0] & /*currentHeadingColor*/ 16384) {
					toggle_class(button42, "pressed", /*currentHeadingColor*/ ctx[14] === '#DDB728');
				}

				if (!current || dirty[0] & /*currentHeadingColor*/ 16384) {
					toggle_class(button43, "pressed", /*currentHeadingColor*/ ctx[14] === '#28D8DD');
				}

				if (!current || dirty[0] & /*currentHeadingColor*/ 16384) {
					toggle_class(button44, "pressed", /*currentHeadingColor*/ ctx[14] === '#FFFFFF');
				}

				if (!current || dirty[0] & /*currentHeadingColor*/ 16384) {
					toggle_class(button45, "pressed", /*currentHeadingColor*/ ctx[14] === '#000000');
				}

				if (!current || dirty[0] & /*currentTextColor*/ 32768) {
					toggle_class(button48, "pressed", /*currentTextColor*/ ctx[15] === '#282ADD');
				}

				if (!current || dirty[0] & /*currentTextColor*/ 32768) {
					toggle_class(button49, "pressed", /*currentTextColor*/ ctx[15] === '#DD8428');
				}

				if (!current || dirty[0] & /*currentTextColor*/ 32768) {
					toggle_class(button50, "pressed", /*currentTextColor*/ ctx[15] === '#DDB728');
				}

				if (!current || dirty[0] & /*currentTextColor*/ 32768) {
					toggle_class(button51, "pressed", /*currentTextColor*/ ctx[15] === '#28D8DD');
				}

				if (!current || dirty[0] & /*currentTextColor*/ 32768) {
					toggle_class(button52, "pressed", /*currentTextColor*/ ctx[15] === '#FFFFFF');
				}

				if (!current || dirty[0] & /*currentTextColor*/ 32768) {
					toggle_class(button53, "pressed", /*currentTextColor*/ ctx[15] === '#000000');
				}

				if (!current || dirty[0] & /*currentLinkColor*/ 65536) {
					toggle_class(button56, "pressed", /*currentLinkColor*/ ctx[16] === '#282ADD');
				}

				if (!current || dirty[0] & /*currentLinkColor*/ 65536) {
					toggle_class(button57, "pressed", /*currentLinkColor*/ ctx[16] === '#DD8428');
				}

				if (!current || dirty[0] & /*currentLinkColor*/ 65536) {
					toggle_class(button58, "pressed", /*currentLinkColor*/ ctx[16] === '#DDB728');
				}

				if (!current || dirty[0] & /*currentLinkColor*/ 65536) {
					toggle_class(button59, "pressed", /*currentLinkColor*/ ctx[16] === '#28D8DD');
				}

				if (!current || dirty[0] & /*currentLinkColor*/ 65536) {
					toggle_class(button60, "pressed", /*currentLinkColor*/ ctx[16] === '#FFFFFF');
				}

				if (!current || dirty[0] & /*currentLinkColor*/ 65536) {
					toggle_class(button61, "pressed", /*currentLinkColor*/ ctx[16] === '#000000');
				}

				if (!current || dirty[0] & /*hideImagesVar*/ 131072) {
					toggle_class(button63, "pressed", /*hideImagesVar*/ ctx[17]);
				}

				if (!current || dirty[0] & /*hideVideosVar*/ 262144) {
					toggle_class(button64, "pressed", /*hideVideosVar*/ ctx[18]);
				}

				if (!current || dirty[0] & /*hideAnimationsVar*/ 524288) {
					toggle_class(button65, "pressed", /*hideAnimationsVar*/ ctx[19]);
				}

				if (!current || dirty[0] & /*showCustomCursor*/ 4194304) {
					toggle_class(button66, "pressed", /*showCustomCursor*/ ctx[22]);
				}

				if (!current || dirty[0] & /*cursorSizeSelectedButton*/ 2097152) {
					toggle_class(button67, "pressed", /*cursorSizeSelectedButton*/ ctx[21] === '1x');
				}

				if (!current || dirty[0] & /*cursorSizeSelectedButton*/ 2097152) {
					toggle_class(button68, "pressed", /*cursorSizeSelectedButton*/ ctx[21] === '1.5x');
				}

				if (!current || dirty[0] & /*cursorSizeSelectedButton*/ 2097152) {
					toggle_class(button69, "pressed", /*cursorSizeSelectedButton*/ ctx[21] === '2x');
				}

				if (!current || dirty[0] & /*cursorSizeSelectedButton*/ 2097152) {
					toggle_class(button70, "pressed", /*cursorSizeSelectedButton*/ ctx[21] === '2.5x');
				}

				if (!current || dirty[0] & /*deactivateAudioVar*/ 1048576) {
					toggle_class(button71, "pressed", /*deactivateAudioVar*/ ctx[20]);
				}

				if (!current || dirty[0] & /*currentCursorColor*/ 8388608) {
					toggle_class(button72, "pressed", /*currentCursorColor*/ ctx[23] === '#282ADD');
				}

				if (!current || dirty[0] & /*currentCursorColor*/ 8388608) {
					toggle_class(button73, "pressed", /*currentCursorColor*/ ctx[23] === '#DD8428');
				}

				if (!current || dirty[0] & /*currentCursorColor*/ 8388608) {
					toggle_class(button74, "pressed", /*currentCursorColor*/ ctx[23] === '#DDB728');
				}

				if (!current || dirty[0] & /*currentCursorColor*/ 8388608) {
					toggle_class(button75, "pressed", /*currentCursorColor*/ ctx[23] === '#28D8DD');
				}

				if (!current || dirty[0] & /*currentCursorColor*/ 8388608) {
					toggle_class(button76, "pressed", /*currentCursorColor*/ ctx[23] === '#FFFFFF');
				}

				if (!current || dirty[0] & /*currentCursorColor*/ 8388608) {
					toggle_class(button77, "pressed", /*currentCursorColor*/ ctx[23] === '#000000');
				}

				if (!current || dirty[0] & /*activateReadingGuide*/ 16777216) {
					toggle_class(button78, "pressed", /*activateReadingGuide*/ ctx[24]);
				}
			},
			i(local) {
				if (current) return;

				if (local) {
					add_render_callback(() => {
						if (!current) return;
						if (div130_outro) div130_outro.end(1);
						div130_intro = create_in_transition(div130, fly, { y: 100, duration: 300 });
						div130_intro.start();
					});
				}

				current = true;
			},
			o(local) {
				if (div130_intro) div130_intro.invalidate();

				if (local) {
					div130_outro = create_out_transition(div130, fly, { y: 100, duration: 200 });
				}

				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(div131);
				}

				if (if_block0) if_block0.d();
				if (if_block1) if_block1.d();
				if (detaching && div130_outro) div130_outro.end();
				mounted = false;
				run_all(dispose);
			}
		};
	}

	// (517:12) {#if profileBlind}
	function create_if_block_3(ctx) {
		let div;

		return {
			c() {
				div = element("div");
				div.innerHTML = `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="Interface / Check"><path id="Vector" d="M6 12L10.2426 16.2426L18.727 7.75732" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></g></svg>`;
				attr(div, "class", "embed-svg check svelte-1q83lbh");
			},
			m(target, anchor) {
				insert(target, div, anchor);
			},
			d(detaching) {
				if (detaching) {
					detach(div);
				}
			}
		};
	}

	// (1980:4) {#if !widgetWhiteLabel}
	function create_if_block_2(ctx) {
		let a;

		return {
			c() {
				a = element("a");
				a.innerHTML = `<span>Accessibility Widget by <span class="accessi_underline svelte-1q83lbh">BetterWeb</span></span>`;
				attr(a, "class", "accessi_footer svelte-1q83lbh");
				attr(a, "href", "https://betterweb.co/");
				attr(a, "target", "_blank");
			},
			m(target, anchor) {
				insert(target, a, anchor);
			},
			d(detaching) {
				if (detaching) {
					detach(a);
				}
			}
		};
	}

	function create_fragment(ctx) {
		let if_block_anchor;
		let if_block = /*showWidget*/ ctx[1] && create_if_block(ctx);

		return {
			c() {
				if (if_block) if_block.c();
				if_block_anchor = empty();
			},
			m(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
			},
			p(ctx, dirty) {
				if (/*showWidget*/ ctx[1]) {
					if (if_block) {
						if_block.p(ctx, dirty);
					} else {
						if_block = create_if_block(ctx);
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},
			i: noop,
			o: noop,
			d(detaching) {
				if (detaching) {
					detach(if_block_anchor);
				}

				if (if_block) if_block.d(detaching);
			}
		};
	}

	function instance($$self, $$props, $$invalidate) {
		testScreenReader();

		/* VARIABLEN */
		let isOpen = true;

		let showWidget = true; // immer auf true lassen

		// Profiles
		let profileBlind = false;

		// Features
		let readableFonts = false;

		let highlightTitles = false;
		let highlightLinks = false;
		let lineHeightSelectedText = '1x';
		let lineHeightSelectedButton = '1x';
		let fontScaleSelectedText = '1x';
		let fontScaleSelectedButton = '1x';
		let letterSpacingSelectedText = '1x';
		let letterSpacingSelectedButton = '1x';
		let textAlignmentSelectedText = '';
		let textAlignmentSelectedButton = '';
		let storedAlignment = '';
		let invertColor = false;
		let darkContrast = false;
		let lightContrastVar = false;
		let currentBackgroundColor = 'none';
		let currentHeadingColor = 'none';
		let currentTextColor = 'none';
		let currentLinkColor = 'none';
		let hideImagesVar = false;
		let hideVideosVar = false;
		let hideAnimationsVar = false;
		let deactivateAudioVar = false;
		let cursorSizeSelectedText = 'none';
		let cursorSizeSelectedButton = 'none';
		let showCustomCursor = false;
		let currentCursorColor = 'none';
		let activateReadingGuide = false;
		let currentTextTransform = 'none';
		let textTransformSelectedButton = 'none';
		let saturationSelectedButton = 'none';

		/* FUNCTIONS */
		function toggleWidget() {
			$$invalidate(0, isOpen = !isOpen);
		}

		function toggleHideWidget() {
			$$invalidate(1, showWidget = !showWidget);
		}

		function toggleProfileBlind() {
			$$invalidate(2, profileBlind = !profileBlind);
		} //sessionStorage.setItem('profileBlind', profileBlind);

		function toggleReadableFonts() {
			$$invalidate(3, readableFonts = !readableFonts);

			//sessionStorage.setItem('readableFonts', readableFonts);
			console.log('Readable Font changed');

			replaceNonSansSerifFonts(readableFonts);
		}

		function toggleHighlightTitles() {
			$$invalidate(4, highlightTitles = !highlightTitles);

			//sessionStorage.setItem('readableFonts', readableFonts);
			console.log('Highlight Titles changed');

			highlightHeadings(highlightTitles);
		}

		function toggleHighlightLinks() {
			$$invalidate(5, highlightLinks = !highlightLinks);

			//sessionStorage.setItem('readableFonts', readableFonts);
			console.log('Highlight Links & Buttons changed');

			highlightLinkButtons(highlightLinks);
		}

		function toggleCases(getType) {
			if (currentTextTransform == getType) {
				getType = 'none';
			}

			applyTextTransform(getType);
			$$invalidate(25, textTransformSelectedButton = getType);
			currentTextTransform = getType;
		}

		function toggleLineHeight(text) {
			lineHeightSelectedText = text;
			$$invalidate(6, lineHeightSelectedButton = text); // Aktualisiert den ausgewählten Button
			adjustLineHeight(lineHeightSelectedText);
		}

		function toggleLetterSpacing(text) {
			letterSpacingSelectedText = text;
			$$invalidate(8, letterSpacingSelectedButton = text); // Aktualisiert den ausgewählten Button
			adjustLetterSpacing(letterSpacingSelectedText);
		}

		function toggleFontScale(text) {
			fontScaleSelectedText = text;
			$$invalidate(7, fontScaleSelectedButton = text); // Aktualisiert den ausgewählten Button
			adjustFontSize(fontScaleSelectedText);
		}

		function toggleTextAlignment(text) {
			textAlignmentSelectedText = text;
			$$invalidate(9, textAlignmentSelectedButton = text); // Aktualisiert den ausgewählten Button

			if (storedAlignment == textAlignmentSelectedButton) {
				console.log('Same');
				$$invalidate(9, textAlignmentSelectedButton = 'none');
			}

			storedAlignment = text;
			adjustTextAlignment(textAlignmentSelectedText);
		}

		function toggleInvertColors() {
			$$invalidate(10, invertColor = !invertColor);

			//sessionStorage.setItem('readableFonts', readableFonts);
			console.log('Highlight Titles changed');

			invertColors(invertColor);
		}

		function toggleDarkContrast() {
			$$invalidate(11, darkContrast = !darkContrast);

			//sessionStorage.setItem('readableFonts', readableFonts);
			darkContract(darkContrast);
		}

		function toggleLightContrast() {
			$$invalidate(12, lightContrastVar = !lightContrastVar);

			//sessionStorage.setItem('readableFonts', readableFonts);
			lightContrast(lightContrastVar);
		}

		function toggleSaturation(mode) {
			if (saturationSelectedButton == mode) {
				$$invalidate(26, saturationSelectedButton = 'none');
			} else {
				$$invalidate(26, saturationSelectedButton = mode);
			}

			console.log(saturationSelectedButton);
			applySaturation(saturationSelectedButton);
		}

		function toggleBackgroundColor(color) {
			$$invalidate(13, currentBackgroundColor = color);
			applyBackgroundColor(color);
		}

		function toggleHeadingColor(color) {
			$$invalidate(14, currentHeadingColor = color);
			applyHeadingColor(color);
		}

		function toggleTextColor(color) {
			$$invalidate(15, currentTextColor = color);
			applyTextColor(color);
		}

		function toggleLinkColor(color) {
			$$invalidate(16, currentLinkColor = color);
			applyLinkColor(color);
		}

		function toggleHideImages() {
			$$invalidate(17, hideImagesVar = !hideImagesVar);
			console.log(hideImagesVar);
			applyHideImages(hideImagesVar);
		}

		function toggleHideVideos() {
			$$invalidate(18, hideVideosVar = !hideVideosVar);
			console.log(hideVideosVar);
			applyHideVideos(hideVideosVar);
		}

		function toggleHideAnimations() {
			$$invalidate(19, hideAnimationsVar = !hideAnimationsVar);
			console.log(hideAnimationsVar);
			applyHideAnimations(hideAnimationsVar);
		}

		function toggleDeaktivateAudio() {
			$$invalidate(20, deactivateAudioVar = !deactivateAudioVar);
			console.log(deactivateAudioVar);
			toggleAudio(deactivateAudioVar);
		}

		function toggleCursorSize(text) {
			cursorSizeSelectedText = text;
			$$invalidate(21, cursorSizeSelectedButton = text); // Aktualisiert den ausgewählten Button

			if (!showCustomCursor) {
				console.log('toggleCursorSize');
				toggleCustomCursor();
			}

			setCursorSize(cursorSizeSelectedText);
		}

		function toggleCustomCursor() {
			$$invalidate(22, showCustomCursor = !showCustomCursor);

			if (!showCustomCursor) {
				$$invalidate(21, cursorSizeSelectedButton = 'none');
			}

			togShowCustomCursor(showCustomCursor);
			console.log(showCustomCursor);
		}

		function toggleCursorColor(color) {
			$$invalidate(23, currentCursorColor = color);

			if (!showCustomCursor) {
				console.log('toggleCursorSize');
				toggleCustomCursor();
			}

			setCursorColor(color);
		}

		function toggleReadingGuide() {
			$$invalidate(24, activateReadingGuide = !activateReadingGuide);
			console.log(activateReadingGuide);
			loadReadingHelper(activateReadingGuide);
		}

		const click_handler = () => toggleCases('capitalize');
		const click_handler_1 = () => toggleFontScale('1x');
		const click_handler_2 = () => toggleFontScale('1.5x');
		const click_handler_3 = () => toggleFontScale('2x');
		const click_handler_4 = () => toggleFontScale('2.5x');
		const click_handler_5 = () => toggleCases('uppercase');
		const click_handler_6 = () => toggleLineHeight('1x');
		const click_handler_7 = () => toggleLineHeight('1.5x');
		const click_handler_8 = () => toggleLineHeight('2x');
		const click_handler_9 = () => toggleLineHeight('2.5x');
		const click_handler_10 = () => toggleCases('lowercase');
		const click_handler_11 = () => toggleLetterSpacing('1x');
		const click_handler_12 = () => toggleLetterSpacing('1.5x');
		const click_handler_13 = () => toggleLetterSpacing('2x');
		const click_handler_14 = () => toggleLetterSpacing('2.5x');
		const click_handler_15 = () => toggleTextAlignment('left');
		const click_handler_16 = () => toggleTextAlignment('center');
		const click_handler_17 = () => toggleTextAlignment('right');
		const click_handler_18 = () => toggleInvertColors();
		const click_handler_19 = () => toggleDarkContrast();
		const click_handler_20 = () => toggleLightContrast();
		const click_handler_21 = () => toggleSaturation('high');
		const click_handler_22 = () => toggleBackgroundColor('#282ADD');
		const click_handler_23 = () => toggleBackgroundColor('#DD8428');
		const click_handler_24 = () => toggleBackgroundColor('#DDB728');
		const click_handler_25 = () => toggleBackgroundColor('#28D8DD');
		const click_handler_26 = () => toggleBackgroundColor('#FFFFFF');
		const click_handler_27 = () => toggleBackgroundColor('#000000');
		const click_handler_28 = () => toggleBackgroundColor('none');
		const click_handler_29 = () => toggleSaturation('low');
		const click_handler_30 = () => toggleHeadingColor('#282ADD');
		const click_handler_31 = () => toggleHeadingColor('#DD8428');
		const click_handler_32 = () => toggleHeadingColor('#DDB728');
		const click_handler_33 = () => toggleHeadingColor('#28D8DD');
		const click_handler_34 = () => toggleHeadingColor('#FFFFFF');
		const click_handler_35 = () => toggleHeadingColor('#000000');
		const click_handler_36 = () => toggleHeadingColor('none');
		const click_handler_37 = () => toggleTextColor('#282ADD');
		const click_handler_38 = () => toggleTextColor('#DD8428');
		const click_handler_39 = () => toggleTextColor('#DDB728');
		const click_handler_40 = () => toggleTextColor('#28D8DD');
		const click_handler_41 = () => toggleTextColor('#FFFFFF');
		const click_handler_42 = () => toggleTextColor('#000000');
		const click_handler_43 = () => toggleTextColor('none');
		const click_handler_44 = () => toggleLinkColor('#282ADD');
		const click_handler_45 = () => toggleLinkColor('#DD8428');
		const click_handler_46 = () => toggleLinkColor('#DDB728');
		const click_handler_47 = () => toggleLinkColor('#28D8DD');
		const click_handler_48 = () => toggleLinkColor('#FFFFFF');
		const click_handler_49 = () => toggleLinkColor('#000000');
		const click_handler_50 = () => toggleLinkColor('none');
		const click_handler_51 = () => toggleHideImages();
		const click_handler_52 = () => toggleHideVideos();
		const click_handler_53 = () => toggleHideAnimations();
		const click_handler_54 = () => toggleCustomCursor();
		const click_handler_55 = () => toggleCursorSize('1x');
		const click_handler_56 = () => toggleCursorSize('1.5x');
		const click_handler_57 = () => toggleCursorSize('2x');
		const click_handler_58 = () => toggleCursorSize('2.5x');
		const click_handler_59 = () => toggleDeaktivateAudio();
		const click_handler_60 = () => toggleCursorColor('#282ADD');
		const click_handler_61 = () => toggleCursorColor('#DD8428');
		const click_handler_62 = () => toggleCursorColor('#DDB728');
		const click_handler_63 = () => toggleCursorColor('#28D8DD');
		const click_handler_64 = () => toggleCursorColor('#FFFFFF');
		const click_handler_65 = () => toggleCursorColor('#000000');
		const click_handler_66 = () => toggleReadingGuide();

		return [
			isOpen,
			showWidget,
			profileBlind,
			readableFonts,
			highlightTitles,
			highlightLinks,
			lineHeightSelectedButton,
			fontScaleSelectedButton,
			letterSpacingSelectedButton,
			textAlignmentSelectedButton,
			invertColor,
			darkContrast,
			lightContrastVar,
			currentBackgroundColor,
			currentHeadingColor,
			currentTextColor,
			currentLinkColor,
			hideImagesVar,
			hideVideosVar,
			hideAnimationsVar,
			deactivateAudioVar,
			cursorSizeSelectedButton,
			showCustomCursor,
			currentCursorColor,
			activateReadingGuide,
			textTransformSelectedButton,
			saturationSelectedButton,
			toggleWidget,
			toggleHideWidget,
			toggleProfileBlind,
			toggleReadableFonts,
			toggleHighlightTitles,
			toggleHighlightLinks,
			toggleCases,
			toggleLineHeight,
			toggleLetterSpacing,
			toggleFontScale,
			toggleTextAlignment,
			toggleInvertColors,
			toggleDarkContrast,
			toggleLightContrast,
			toggleSaturation,
			toggleBackgroundColor,
			toggleHeadingColor,
			toggleTextColor,
			toggleLinkColor,
			toggleHideImages,
			toggleHideVideos,
			toggleHideAnimations,
			toggleDeaktivateAudio,
			toggleCursorSize,
			toggleCustomCursor,
			toggleCursorColor,
			toggleReadingGuide,
			click_handler,
			click_handler_1,
			click_handler_2,
			click_handler_3,
			click_handler_4,
			click_handler_5,
			click_handler_6,
			click_handler_7,
			click_handler_8,
			click_handler_9,
			click_handler_10,
			click_handler_11,
			click_handler_12,
			click_handler_13,
			click_handler_14,
			click_handler_15,
			click_handler_16,
			click_handler_17,
			click_handler_18,
			click_handler_19,
			click_handler_20,
			click_handler_21,
			click_handler_22,
			click_handler_23,
			click_handler_24,
			click_handler_25,
			click_handler_26,
			click_handler_27,
			click_handler_28,
			click_handler_29,
			click_handler_30,
			click_handler_31,
			click_handler_32,
			click_handler_33,
			click_handler_34,
			click_handler_35,
			click_handler_36,
			click_handler_37,
			click_handler_38,
			click_handler_39,
			click_handler_40,
			click_handler_41,
			click_handler_42,
			click_handler_43,
			click_handler_44,
			click_handler_45,
			click_handler_46,
			click_handler_47,
			click_handler_48,
			click_handler_49,
			click_handler_50,
			click_handler_51,
			click_handler_52,
			click_handler_53,
			click_handler_54,
			click_handler_55,
			click_handler_56,
			click_handler_57,
			click_handler_58,
			click_handler_59,
			click_handler_60,
			click_handler_61,
			click_handler_62,
			click_handler_63,
			click_handler_64,
			click_handler_65,
			click_handler_66
		];
	}

	class Widget extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance, create_fragment, safe_not_equal, {}, add_css, [-1, -1, -1, -1, -1]);
		}
	}

	// Funktion, um das Widget zu initialisieren
	function initWidget() {
	    // Suche nach einem Container-Element im DOM
	    let targetElement = document.getElementById('widget-container');

	    // Wenn das Element nicht existiert, erstelle es
	    if (!targetElement) {
	        const container = document.createElement('div');
	        container.id = 'widget-container';
	        container.style.zIndex = 2147483647;
	        document.body.appendChild(container);
	        targetElement = container;
	    }

	    // Initialisiere das Widget
	    new Widget({
	        target: targetElement,
	    });
	}


	// Initialisiere das Widget, sobald das DOM bereit ist
	if (document.readyState === 'loading') {
	    document.addEventListener('DOMContentLoaded', initWidget);
	} else {
	    initWidget();
	}

})();
