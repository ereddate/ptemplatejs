'use strict';
(function(win) {
	var doc = win.document;
	Array.prototype._eq = function(index) {
		return index < 0 ? this[this.length + index] : this[index];
	};
	var mod = {
			templates: {},
			tmplThesaurus: {},
			tmplAttributes: {},
			routes: {},
			eventData: [],
			watch: function(obj, key, val, callback) {
				mod.createObject(obj, key, val, callback);
				return this;
			},
			createObject: function(obj, name, _class, callback) {
				Reflect.defineProperty(obj, name, {
					get: function() {
						return _class
					},
					set: function(newClassObject) {
						if (_class == newClassObject) return;
						var oldClass = _class;
						_class = newClassObject;
						console.log(_class);
						callback && callback.call(obj, name, _class, oldClass);
					}
				});
				return this;
			},
			is: function(b, a) {
				if (typeof b == "string") switch (b) {
					case "number":
					case "string":
					case "object":
						return Object.is(typeof a, b);
						break;
					case "array":
						var len = typeof a != "string" && ("length" in a) && a.length,
							c = (typeof a).toLowerCase();
						return "array" === c || 0 === len || "number" == typeof len && len > 0 && len - 1 in a
						break;
				}
				return Object.is(a, b);
			},
			set: function(n, o) {
				mod.templates[n] && mod.extend(mod.templates[n].data, o || {});
			},
			each: function(a, b, c) {
				var d, e = 0,
					f = a.length,
					g = mod.is("array", a);
				if (c) {
					if (g) {
						for (; f > e; e++)
							if (d = b.apply(a[e], c), d === !1) break
					} else
						for (var e in a)
							if (d = b.apply(a[e], c), d === !1) break
				} else if (g) {
					for (; f > e; e++)
						if (d = b.call(a[e], e, a[e]), d === !1) break
				} else
					for (var e in a)
						if (d = b.call(a[e], e, a[e]), d === !1) break;
				return a
			},
			jsonToUrlString: function(obj, at) {
				var str = [];
				mod.each(obj, (name, val) => {
					val != "" && str.push(name + "=" + val.toString());
				});
				return str.length > 0 ? str.join(at) : "";
			},
			mixElement(element) {
				mod.extend(element, pSubClass);
				element.children && [...element.children].forEach(function(e){
					mod.mixElement(e);
				});
				return element;
			},
			tmpl: function(obj, data) {
				var bindAttrElement = {
					bind: {},
					for: {}
				}
				if (mod.is(typeof obj, "string")) {
					mod.each(data, function(n, v) {
						var reg = new RegExp("{{\\s*" + n + "\\s*(\\|\\s*([^<>,]+)\\s*)*}}", "gim"),
							u = Object.is(typeof v, "function") ? v() : v;
						obj = obj.replace(reg, function(a, b) {
							if (b) {
								b = b.split(':');
								a = mod.tmplThesaurus[b[0].replace(/\s*\|\s*/gim, "").replace(/\s+/gim, "")] && mod.tmplThesaurus[b[0].replace(/\s*\|\s*/gim, "").replace(/\s+/gim, "")](u, b[1] && b[1].replace(/^\s+/gim, "") || undefined) || a;
							} else {
								a = u;
							}
							return a;
						});
					});
				} else if (obj.nodeType) {
					mod.mixElement(obj);
					var attrs = obj.attributes && obj.attributes.length > 0 && [...obj.attributes] || false;
					if (attrs) {
						attrs.forEach(function(a) {
							mod.each(data, function(n, v) {
								var reg = new RegExp("{{\\s*" + a.name + "\\s*(\\|\\s*([^<>,]+)\\s*)*}}", "gim"),
									u = Object.is(typeof v, "function") ? v() : v;
								a.value = a.value.replace(reg, function(a, b) {
									if (b) {
										b = b.split(':');
										a = mod.tmplThesaurus[b[0].replace(/\s*\|\s*/gim, "")] && mod.tmplThesaurus[b[0].replace(/\s*\|\s*/gim, "")](u, b[1]) || a;
									} else {
										a = u;
									}
									return a;
								});
							});
							if (/^p-/.test(a.name.toLowerCase())) {
								var name = a.name.replace(/p\-/gim, "").split(':');
								if (mod.tmplAttributes[name[0]])
									mod.tmplAttributes[name[0]](obj, name[1], {
										name: a.name,
										value: a.value
									}, data);
								else {
									var belem = bindAttrElement[a.name.toLowerCase().replace("p-", "") == "for" ? "bind" : "for"],
										vname = a.value.split(' ');
									vname.forEach((n) => {
										!belem[n] ? belem[n] = [obj] : belem[n].push(obj);
									});
									obj._removeAttr(a.name);
								}
							}
						});
					}
					for (var name in bindAttrElement.bind) {
						var e = bindAttrElement.bind[name];
						mod.each(e, (i, elem) => {
							if (bindAttrElement.for[name]) {
								var f = bindAttrElement.for[name];
								mod.each(f, (n, felem) => {
									!elem._bindElement ? elem._bindElement = [felem] : elem._bindElement.push(felem);
								});
							}
						})
					}
					obj.children && mod.each([...obj.children], function(i, e) {
						mod.tmpl(e, data);
					});
				}
				return obj;
			},
			map: function(elems, callback, arg) {
				var ret = [],
					i = 0;
				typeof elems == "array" && elems.forEach((e) => {
					var result = callback(e, i, arg);
					if (result) {
						ret.push(result);
					}
					i += 1;
				});
				return ret;
			},
			on: function(then, eventName, callback, bool) {
				eventName = eventName.split(' ');
				eventName.forEach((ev) => {
					var fn = (e) => {
						bool && then._off(ev);
						callback && callback.call(then, e);
					};
					then.addEventListener(ev, fn, false);
					mod.eventData.push({
						element: then,
						eventName: ev,
						factory: fn,
						bool: bool
					});
				});
				return this;
			},
			off: function(then, eventName) {
				var i = 0;
				if (mod.is(typeof eventName, "undefined")) {
					mod.eventData.forEach((a) => {
						i += 1;
						if (mod.is(a.element, then)) mod.eventData.splice(i, 1)
					});
					return this;
				}
				eventName = eventName.split(' ');
				eventName.forEach((ev) => {
					mod.eventData.forEach((a) => {
						i += 1;
						if (mod.is(a.element, then) && mod.is(a.eventName, ev)) {
							then.removeEventListener(ev, a.factory, false);
							mod.eventData.splice(i, 1);
						}
					})
				});
				return this;
			},
			trigger: function(then, eventName, args) {
				eventName = eventName.toLowerCase().split(' ');
				eventName.forEach((ev) => {
					mod.eventData.forEach((a) => {
						if (mod.is(a.element, then) && mod.is(a.eventName, ev)) {
							if (ev == "scroll") setTimeout(() => {
								window.scrollTo(1, 1)
							}, 1);
							var event = null;
							document.createEvent ? (event = document.createEvent("HTMLEvents"), event.initEvent(eventName, true, true)) : (event = document.createEventObject());
							a.factory.call(a.element, event, args);
						}
					})
				});
				return this;
			},
			trim: function(str) {
				return str.replace(/(^\s*)|(\s*$)/g, "");
			},
			dir: function(elem, dir) {
				var matched = [];
				while ((elem = elem[dir]) && elem.nodeType !== 9) {
					if (elem.nodeType === 1) {
						matched.push(elem);
					}
				}
				return matched;
			},
			parents: function(elem, id) {
				var parent = null;
				parent = mod.dir(elem, "parentNode");
				if (id) {
					mod.each(parent, (i, item) => {
						if (/^#/.test(id) && item.id && item.id == id.replace("#", "")) {
							parent = [item];
							return false;
						} else if (/^\./.test(id) && (new RegExp(id.replace(".", ""))).test(item.className)) {
							parent = [item];
							return false;
						} else if (item.tagName.toLowerCase() == id.toLowerCase()) {
							parent = [item];
							return false;
						}
					});
				} else {
					return parent;
				}
				return parent && id && parent.length === 1 && parent[0] || parent;
			},
			isEmptyObject: function(obj) {
				var name;
				for (var name in obj) {
					return false;
				}
				return true;
			},
			isPlainObject: function(obj) {
				var key;
				if (!obj || typeof obj !== "object" || obj.nodeType) {
					return false;
				}
				try {
					if (obj.constructor &&
						!hasOwn.call(obj, "constructor") &&
						!hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
						return false;
					}
				} catch (e) {
					return false;
				}
				for (key in obj) {}
				return key === undefined || hasOwn.call(obj, key);
			},
			extend: function(a, b) {
				return Object.assign(a, b);
			},
			has: function(target, obj) {
				var hasIn = false;

				if ((Array.isArray || _instanceOf(Array))(target)) {
					var i = -1;
					target.forEach((t) => {
						if (t === obj) hasIn = i + 1;
						i += 1;
					});
					return hasIn;
				} else if (_instanceOf(String)) {
					var reg = new RegExp(obj, "gim");
					return reg.test(target);
				} else {
					for (var name in target) {
						if (typeof obj == "object" && target[name] == obj[name] || typeof obj == "string" && name == obj) hasIn = name;
					}
					return hasIn;
				}
				return hasIn;
			},
			findNode: function(selector, element) {
				element = element || doc;
				if (/^name=/.test(selector)) {
					var children = element.getElementsByName && element.getElementsByName(selector.toLowerCase().replace(/^name=/gim, ""));
					if (children) {
						return [...children];
					}
				} else if (/template\:/.test(selector)) {
					var nodes = element.querySelectorAll("[p-" + selector.replace(":", "=") + "]");
					return [...nodes];
				} else if (/\[[^\[\]]+\]/.test(selector)) {
					var reg = /([^\[\]]+)\s*\[([^\[\]]+)\]/.exec(selector);
					if (reg) {
						var nodes = [];
						[...element.querySelectorAll(reg[1])].forEach((e) => {
							var exp = new RegExp(reg[2].split('=')[1].replace(/\:/gim, "\\s*\\:\\s*"), "gim"),
								is = exp.test(e.getAttribute(reg[2].split('=')[0]));
							if (is) {
								nodes.push(e);
							}
						});
						return nodes;
					}
				} else if (/\:/.test(selector)) {
					var reg = /([^\[\]]+)\s*\:\s*([^\[\]]+)/.exec(selector);
					if (reg) {
						var nodes = [];
						[...element.querySelectorAll(reg[1])].forEach((e) => {
							var elems = e["_" + reg[2]] && e["_" + reg[2]]() || null;
							if (elems && elems.nodeType) {
								nodes.push(elems);
							} else if (elems && elems.length > 0) {
								mod.extend(nodes, elems);
							}
						});
						return nodes;
					}
				}
				var node = element.querySelectorAll(selector);
				return [...node];
			}
		},
		hasOwn = {}.hasOwnProperty,
		_instanceOf = (_constructor) => {
			return function(o) {
				return (o instanceof _constructor);
			};
		},
		pSubClass = {
			_set(n, ops) {
				mod.set(n, ops);
				return this;
			},
			_watch(key, callback) {
				mod.watch(this, key, this._val(), callback);
				return this;
			},
			_findNode(selector) {
				var then = this,
					result = [];
				selector.split(' ').forEach((e) => {
					result = result.concat(mod.findNode(then, e));
				});
				return result;
			},
			_length(bool) {
				return bool ? this.childNodes.length : this._children().length;
			},
			_map(callback, arg) {
				return mod.map(this._children(), callback, arg);
			},
			_contents() {
				var elem = this;
				return elem.tagName && elem.tagName.toLowerCase() == "iframe" ? elem.contentDocument || elem.contentWindow.document : elem.childNodes && [...elem.childNodes] || [];
			},
			_empty() {
				var element = this;
				[...element.childNodes].forEach((e) => {
					e._remove();
				});
				return this;
			},
			_parents(selector) {
				var then = this;
				return mod.parents(then, selector);
			},
			_attr(name, value) {
				var then = this;
				if (typeof value != "undefined")
					typeof name != "string" && [].slice.call(name).forEach((e) => {
						then.setAttribute(e.name, e.value);
						then[e.name] = e.value;
					}) || typeof value != "undefined" && ((then[name] = value), then.setAttribute(name, value));
				else {
					return then.getAttribute(name);
				}
				return this;
			},
			_children(selector) {
				if (selector) {
					return [...this.querySelectorAll(selector)]
				} else {
					return [...this.children];
				}
			},
			_removeAttr(name) {
				name.split(' ').forEach((n) => {
					this.removeAttribute(n);
				});
				return this;
			},
			_text(value) {
				var then = this,
					nodeType = then.nodeType;
				if (nodeType) {
					if ((nodeType === 1 || nodeType === 9 || nodeType === 11) && typeof then.textContent === "string") {
						if (typeof value != "undefined") {
							then.textContent = value;
							return this;
						} else {
							return then.textContent;
						}
					} else if (nodeType === 3 || nodeType === 4) {
						if (typeof value != "undefined") {
							then.nodeValue = value;
							return this;
						} else {
							return then.nodeValue;
						}
					} else {
						return typeof value != "undefined" ? this : "";
					}
				} else {
					return typeof value != "undefined" ? this : "";
				}
			},
			_html(value) {
				var then = this;
				if (typeof value != "undefined" && typeof value != "boolean") {
					if (typeof value == "string") {
						then.innerHTML = value;
					} else if (typeof value != "undefined" && value.nodeType) {
						then._append(value);
					} else if (typeof value == "function") {
						then._html(value());
					} else {
						then.innerHTML = value;
					}
					return then;
				} else if (value === true) {
					return then.outerHTML;
				}
				return then.innerHTML;
			},
			_val(value) {
				if (Reflect.has(this, "value")) {
					if (typeof value != "undefined") {
						this._attr("value", value);
					} else {
						return this.value;
					}
				} else if (typeof value != "undefined") {
					this._html(value);
				} else {
					return this._html();
				}
				return this;
			},
			_clone(bool) {
				var nE = this.cloneNode(!mod.is(typeof bool, "undefined") ? bool : true);
				return nE;
			},
			_on(eventName, fn) {
				mod.on(this, eventName, fn);
				return this;
			},
			_off(eventName) {
				mod.off(this, eventName);
				return this;
			},
			_trigger(eventName, args) {
				mod.trigger(this, eventName, args);
				return this;
			},
			_one(eventName, fn) {
				mod.on(this, eventName, fn, true);
				return this;
			},
			_remove(element) {
				element && element.nodeType && this.removeChild(element) || this.parentNode && this.parentNode.removeChild(this);
				return this;
			},
			_append(element) {
				if (mod.is(typeof element, "string")) {
					var n = doc.createElement("div"),
						f = doc.createDocumentFragment();
					n.innerHTML = element;
					[...n.childNodes].forEach(function(b) {
						f.appendChild(b)
					});
					this.appendChild(f);
				} else if (mod.is(typeof element, "function")) {
					element(this);
				} else {
					this.appendChild(element);
				}
				return this;
			},
			_appendTo(element) {
				element.appendChild(this);
				return this;
			},
			_first() {
				return this._children()._eq(0)
			},
			_last() {
				return this._children()._eq(-1)
			},
			_prepend(element) {
				var previous = this.firstChild;
				previous && this.insertBefore(element, previous) || this.appendChild(element);
				return this;
			},
			_prependTo(element) {
				element._prepend(this);
				return this;
			},
			_after(element) {
				var next = this[i].nextElementSibling || this[i].nextSibling;
				next && this.parentNode.insertBefore(element, next) || this.parentNode.appendChild(element);
				return this;
			},
			_css(name, value) {
				var args = arguments,
					len = args.length;
				if (len === 0) {
					return this;
				} else if (len === 1) {
					if ("style" in this) {
						if (mod.is(typeof name, "string")) {
							var f = [],
								then = this;
							name.split(' ').forEach((n) => {
								f.push(then.style[n]);
							});
							return f.length > 1 ? f : f.join('');
						} else if (mod.isPlainObject(name)) {
							for (var n in name) {
								this.style[n] = name[n]
							}
							return this;
						}
					} else {
						return this;
					}
				} else {
					this.style[name] = value;
					return this;
				}
			},
			_addClass(name) {
				var then = this;
				name.split(' ').forEach((n) => {
					then._removeClass(n);
					then.className += " " + n;
				});
				return this;
			},
			_removeClass(name) {
				var then = this;
				name.split(' ').forEach((n) => {
					mod.has(then.className, n) && (then.className = then.className.replace(new RegExp("\\s*" + n, "gim"), ""));
				});
				return this;
			},
			_prop(name, value) {
				if (typeof value != "undefined") {
					this[name] = typeof value == "function" ? value.call(this, name, this) : value;
					return this;
				} else {
					return this[name];
				}
			},
			_data(name, value) {
				if (/^data-/.test(name)) {
					return this._attr(name, value);
				}!this._elementData && (this._elementData = {});
				if (typeof value != "undefined") {
					this._elementData[name] = value;
					return this;
				} else {
					return this._elementData[name];
				}
			},
			_removeData(name) {
				if (/^data-/.test(name)) {
					return this._removeAttr(name);
				}
				this._elementData && this._elementData[name] && (delete this._elementData[name]);
				return this;
			},
			_toggleClass(name) {
				var then = this;
				name.split(' ').forEach((n) => {
					mod.has(then.className, n) ? then._removeClass(n) : then._addClass(n);
				});
				return this;
			},
			_hasClass(name) {
				var then = this,
					bool = [];
				name.split(' ').forEach((n) => {
					bool.push(mod.has(then.className, n));
				});
				return bool.length === 0 ? false : bool.length === 1 ? bool[0] : bool;
			},
			_width(value) {
				var getStyle = window.getComputedStyle(this, null);
				if (value) {
					return this.offsetWidth +
						parseFloat(getStyle.getPropertyValue('border-left-width')) +
						parseFloat(getStyle.getPropertyValue('margin-left')) +
						parseFloat(getStyle.getPropertyValue('margin-right')) +
						parseFloat(getStyle.getPropertyValue('padding-left')) +
						parseFloat(getStyle.getPropertyValue('padding-right')) +
						parseFloat(getStyle.getPropertyValue('border-right-width'))
				} else if (value != undefined) {
					this.style.width = value;
				} else {
					return this.offsetWidth -
						parseFloat(getStyle.getPropertyValue('border-left-width')) -
						parseFloat(getStyle.getPropertyValue('padding-left')) -
						parseFloat(getStyle.getPropertyValue('padding-right')) -
						parseFloat(getStyle.getPropertyValue('border-right-width'));
				}
				return this;
			},
			_show() {
				this._css({
					display: "block"
				});
				return this;
			},
			_hide() {
				this._css({
					display: "none"
				});
				return this;
			},
			_height(value) {
				var getStyle = window.getComputedStyle(this, null);
				if (value) {
					return this.offsetHeight +
						parseFloat(getStyle.getPropertyValue('border-top-width')) +
						parseFloat(getStyle.getPropertyValue('margin-top')) +
						parseFloat(getStyle.getPropertyValue('margin-bottom')) +
						parseFloat(getStyle.getPropertyValue('padding-top')) +
						parseFloat(getStyle.getPropertyValue('padding-bottom')) +
						parseFloat(getStyle.getPropertyValue('border-bottom-width'))
				} else if (value != undefined) {
					this.style.height = value;
				} else {
					return this.offsetHeight -
						parseFloat(getStyle.getPropertyValue('border-top-width')) -
						parseFloat(getStyle.getPropertyValue('padding-top')) -
						parseFloat(getStyle.getPropertyValue('padding-bottom')) -
						parseFloat(getStyle.getPropertyValue('border-bottom-width'));
				}
				return this;
			},
			_tmpl(data) {
				return mod.tmpl(this.innerHTML, data);
			},
			_offset() {
				return {
					top: this.offsetTop,
					left: this.offsetLeft
				}
			},
			_index() {
				return this.parentNode ? this._prevAll().length : -1;
			},
			_prevAll() {
				return mod.dir(this, "previousElementSibling");
			},
			_nextAll() {
				return mod.dir(this, "nextElementSibling");
			},
			_previous() {
				return this.previousElementSibling;
			},
			_next() {
				return this.nextElementSibling;
			},
			_has(a, b) {
				return mod.has(a, b);
			},
			_scrollLeft(value) {
				if (val === undefined) {
					return this.window == this ? ("pageXOffset" in win) ? win["pageXOffset"] : this.document.documentElement["scrollTop"] : this["scrollLeft"];
				}
				this["scrollLeft"] = val;
				return this;
			},
			_scrollTop(value) {
				if (value === undefined) {
					return this.window == this ? ("pageYOffset" in win) ? win["pageYOffset"] : this.document.documentElement["scrollTop"] : this["scrollTop"];
				}
				this["scrollTop"] = value;
				return this;
			}
		};
	var pTemplate = {
		__mod__: mod,
		query: function(selector, parent) {
			var elems = mod.findNode(selector, parent);
			mod.mixElement(elems);
			return elems;
		},
		each: function(a, callback){
			mod.each(a, callback);
			return this;
		},
		ready: function(callback) {
			var then = this,
				completed = () => {
					doc.removeEventListener("DOMContentLoaded", completed);
					win.removeEventListener("load", completed);
					callback && callback();
				};
			doc.addEventListener("DOMContentLoaded", completed);
			win.addEventListener("load", completed);
			return then;
		},
		watch: function(obj, key, val, callback) {
			mod.watch(obj, key, val, callback);
			return this;
		},
		extend: function(a, b) {
			return mod.extend(a, b)
		},
		getTemplate: function(name) {
			return mod.templates[name] || {};
		},
		router: function(params) {
			!mod.routes && (mod.routes = {});
			mod.extend(mod.routes, params);
			return this;
		},
		render: function(name, data, callback) {
			var that = this,
				parent = mod.findNode("template:" + name);
			if (!parent || parent.length === 0) {
				parent = mod.templates[name] && [mod.templates[name].parent] || [];
			}
			if (parent && parent.length > 0) {
				!mod.templates[name] && (mod.templates[name] = {
					parent: parent[0],
					content: parent[0].innerHTML,
					data: data
				}, mod.each(mod.templates[name].data, function(n, val) {
					mod.createObject(mod.templates[name].data, n, val, function(a, b) {
						that.render(name, data, callback);
					})
				}));
				var html = mod.tmpl(mod.templates[name].content, mod.templates[name].data || {});
				parent[0].innerHTML = html;
				mod.tmpl(parent[0], data);
				callback && callback(parent[0]);
				/*parent[0].addEventListener("DOMSubtreeModified", function(e) {
					if (e.target.nodeType === 1) {
						e.target._trigger && e.target._trigger("watch");
					}
				});
				parent[0].addEventListener("DOMNodeInserted", function(e) {
					if (e.target.nodeType === 1) {
						e.target._trigger && e.target._trigger("domcontentloaded");
					}
				});
				parent[0].addEventListener("DOMNodeRemoved", function(e) {
					if (e.target.nodeType === 1) {
						e.target._trigger && e.target._trigger("watch");
					}
				});*/
			}
			return this;
		},
		set: function(name, data) {
			mod.set(name, data);
			return this;
		}
	};
	win.$ = win.pTemplate = pTemplate;
})(this);