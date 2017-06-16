/*!
 * ptemplatejs v1.0.0
 * @author yandong
 *
 * https://github.com/ereddate/ptemplatejs
 */
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
			Styles: {},
			toStyle(val) {
				let style = [];
				for (let name in val) style.push(name + ":'" + val[name] + "'");
				var a = [];
				style.forEach((e) => {
					e = e.split(':');
					a.push(e[0].replace(/\"/gi, "").replace(/\'/gi, "").replace(/[a-zA-Z]/gim, ((a) => {
						return /[A-Z]/.test(a) ? "-" + a.toLowerCase() : a;
					})) + ":" + e[1].replace(/\"/gi, "").replace(/\'/gi, ""));
				});
				return a.join(';') + ";"
			},
			setAttrs: function(elem, name, value) {
				switch (name) {
					case "text":
						if (mod.is(typeof value, "function")) {
							var r = value.call(elem, name);
							mod.setAttrs(elem, name, r);
						} else if (mod.is(typeof value, "string") && elem.nodeType != 11) {
							elem._text(value)
						} else {
							var textnode = doc.createTextNode(value);
							elem.appendChild(textnode);
						}
						break;
					case "html":
						value = mod.is(typeof value, "function") ? value.call(elem, name) : value;
						elem._html(value);
						break;
					case "class":
						elem._addClass(value);
						break;
					case "handle":
						for (var n in value) {
							elem._on(n, value[n]);
						}
						break;
					case "css":
						elem.style.cssText = mod.isPlainObject(value) ? mod.toStyle(value) : value;
						break;
					default:
						elem._attr(name, value);
						break;
				}
			},
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
						return a == b;
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
				console.log(mod.templates[n].data)
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
			mixElement: function(element) {
				mod.extend(element, pSubClass);
				element.children && [...element.children].forEach(function(e) {
					mod.mixElement(e);
				});
				return element;
			},
			promise: function(v, then) {
				Object.is(typeof v, "function") ? (new Promise((resolve, reject) => {
					v(resolve, reject)
				})).then(function(r) {
					then(r)
				}, function(error) {
					console.log("error." + error);
					then(null)
				}) : then(v);
			},
			createDom: function() {
				var args = arguments,
					len = args.length,
					tagName, attrs, tag, arr = mod.extend([], args);
				if (len < 2) return;
				tagName = args[0];
				attrs = args[1];
				var childrens = [],
					i = 0;
				arr.forEach((r) => {
					i += 1;
					if (i > 2) childrens.push(r);
				});
				tag = /textnode/.test(tagName.toLowerCase()) ? doc.createTextNode("") : /docmentfragment/.test(tagName.toLowerCase()) ? doc.createDocumentFragment() : doc.createElement(tagName);
				if (!/textnode|docmentfragment/.test(tagName.toLowerCase())) {
					mod.mixElement(tag);
					for (var name in attrs) {
						var value = attrs[name];
						mod.setAttrs(tag, name, value);
					}
				} else {
					mod.mixElement(tag);
				}
				childrens.forEach(function(e) {
					if (mod.is(typeof e, "function")) {
						var items = e();
						tag.appendChild(items);
					} else {
						tag.appendChild(e);
					}
				});
				return tag;
			},
			tmpl: function(obj, data) {
				var bindAttrElement = {
					bind: {},
					for: {}
				}
				if (mod.is(typeof obj, "string")) {
					mod.each(data, function(n, v) {
						var reg = new RegExp("{{\\s*" + n + "\\s*(\\|\\s*([^<>,}]+)\\s*)*}}", "gim"),
							then = function(u) {
								if (u) {
									obj = obj.replace(reg, function(a, b) {
										//console.log(a, b, u)
										if (b) {
											b = b.split(':');
											a = mod.tmplThesaurus[b[0].replace(/\s*\|\s*/gim, "").replace(/\s+/gim, "")] && mod.tmplThesaurus[b[0].replace(/\s*\|\s*/gim, "").replace(/\s+/gim, "")](u, b[1] && b[1].replace(/^\s+/gim, "") || undefined) || a;
											//console.log(a);
										} else {
											a = u;
										}
										return a;
									});
								}
								//console.log(obj)
							};
						mod.promise(v, then);
					});
				} else if (obj.nodeType) {
					//console.log(obj.tagName)
					if (obj.tagName && mod.templates[obj.tagName.toLowerCase()]) {
						var attr = obj.attributes,
							newObj = {};
						mod.each(attr, function(i, b) {
							newObj[b.name] = b.value;
						});
						var mData = mod.extend(mod.templates[obj.tagName.toLowerCase()].data, newObj),
							a = mod.createDom("div", {
								html: mod.tmpl(mod.templates[obj.tagName.toLowerCase()].content, mData)
							});
						obj.parentNode && obj.parentNode.replaceChild(mod.tmpl(a.children[0], mData), obj);
					} else {
						mod.mixElement(obj);
						var attrs = obj.attributes && obj.attributes.length > 0 && [...obj.attributes] || false;
						if (attrs) {
							attrs.forEach(function(a) {
								(new Promise((resolve, reject) => {
									mod.each(data, function(n, v) {
										var reg = new RegExp("{{\\s*" + a.name + "\\s*(\\|\\s*([^<>,]+)\\s*)*}}", "gim"),
											then = function(u) {
												if (u) {
													a.value = a.value.replace(reg, function(a, b) {
														if (b) {
															b = b.split(':');
															a = mod.tmplThesaurus[b[0].replace(/\s*\|\s*/gim, "")] && mod.tmplThesaurus[b[0].replace(/\s*\|\s*/gim, "")](u, b[1]) || a;
														} else {
															a = u;
														}
														return a;
													});
												}
												resolve();
											};
										mod.promise(v, then);
									});
								})).then(function() {
									if (/^p-/.test(a.name.toLowerCase())) {
										var name = a.name.replace(/p\-/gim, "").split(':');
										if (mod.tmplAttributes[name[0]])
											mod.tmplAttributes[name[0]](obj, name[1], {
												name: a.name,
												value: a.value
											}, data, obj.parentNode);
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
			on: function(then, eventName, callback, args, bool, onebool) {
				eventName = eventName.split(' ');
				eventName.forEach((ev) => {
					var fn = (e) => {
						//onebool && then._off(ev);
						callback && callback.call(then, e, args);
					};
					then.addEventListener(ev, fn, bool || false);
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
							then.removeEventListener(ev, a.factory, a.bool || false);
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
			setFontSize: function(num) {
				var num = num || 16,
					iWidth = document.documentElement.clientWidth,
					iHeight = document.documentElement.clientHeight,
					fontSize = window.orientation && (window.orientation == 90 || window.orientation == -90) || iHeight < iWidth ? iHeight / num : iWidth / num;
				window.baseFontSize = fontSize;
				document.getElementsByTagName('html')[0].style.fontSize = fontSize.toFixed(2) + 'px';
				return fontSize;
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
			_on(eventName, fn, args, bool) {
				mod.on(this, eventName, fn, args, bool, false);
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
			/*_once(eventName, fn) {
				mod.on(this, eventName, fn, undefined, false, true);
				return this;
			},*/
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
		each: function(a, callback) {
			mod.each(a, callback);
			return this;
		},
		getBaseFontSize: function() {
			return window.baseFontSize || mod.setFontSize(num);
		},
		setBaseFontSize: function(num) {
			mod.setFontSize(num);
			mod.on(win, "orientationchange resize", () => {
				mod.setFontSize(num);
			});
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
		clone: function(from, to) {
			var toTmpl = mod.extend({}, mod.templates[from]);
			mod.templates[to] = toTmpl;
			return this;
		},
		createStyle: function(style) {
			for (let name in style) {
				if (!Reflect.has(mod.Styles, name))
					style[name] = mod.toStyle(style[name]);
				else {
					Reflect.deleteProperty(style, name);
					style[name] = mod.Styles[name];
				}
			}
			return mod.extend(mod.Styles, style);
		},
		getStyle: function(name) {
			return !Object.is(mod.Styles[name], undefined) && mod.Styles[name];
		},
		createDom: function( /*name, attrs, children, ...*/ ) {
			return mod.createDom.apply(mod, arguments);
		},
		createTemplate: function(name, args, bool) {
			var template = mod.findNode("template:" + name),
				ops = {
					parent: undefined,
					content: template.length > 0 ? template[0].innerHTML : "",
					data: {}
				};
			!mod.templates[name] && (mod.templates[name] = args ? mod.extend(bool ? ops : ops.data, args) && ops : ops);
			return this;
		},
		mixElement: function(elem) {
			mod.mixElement(elem)
			return elem;
		},
		render: function(name, data, parent, callback) {
			var that = this,
				template, then = function(name) {
					if (name) {
						if (typeof name == "string") {
							template = mod.findNode("template:" + name) || mod.templates[name].content;
						} else if (name.nodeType) {
							template = [name];
							name = name._attr("p-template");
						}
						if (typeof parent == "function") {
							callback = parent;
							parent = template || mod.templates[name] && [mod.templates[name].parent] || [];
						} else if (!parent || parent.length === 0) {
							parent = template || mod.templates[name] && [mod.templates[name].parent] || [];
						}
						if (parent && parent.length > 0) {
							!mod.templates[name] && that.createTemplate(name, {
								parent: parent[0],
								content: template[0].innerHTML,
								data: data
							}, true) || mod.extend(mod.templates[name], {
								parent: parent[0],
								data: data
							});
							var fn = function() {
								that.render(name, data, parent, callback);
							};
							mod.each(mod.templates[name].data, function(n, val) {
								mod.createObject(mod.templates[name].data, n, val, function(a, b) {
									fn();
								})
							});
							var html = mod.tmpl(mod.templates[name].content, data || {});
							parent[0].innerHTML = html;
							mod.tmpl(parent[0], data);
							callback && callback(parent[0]);
						}
					}
				};
			mod.promise(name, then);
			return this;
		},
		tmpl: function(elem, data) {
			return mod.tmpl(elem, data);
		},
		set: function(name, data) {
			mod.set(name, data);
			return this;
		}
	};
	win.$ = win.pTemplate = pTemplate;
})(this);