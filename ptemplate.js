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
	var triggerEvent = doc.createEvent ? function(element, eventName, args, data) {
		var event = doc.createEvent("HTMLEvents");
		event.data = data;
		event.args = args;
		event.initEvent(eventName, true, true);
		element.dispatchEvent(event);
		return event;
	} : function(element, eventName, args, data) {
		var event = doc.createEventObject();
		event.data = data;
		event.args = args;
		element.fireEvent("on" + eventName, event);
		return event;
	};
	var removeEvent = doc.removeEventListener ?
		function(elem, type, handle) {
			if (elem.removeEventListener) {
				elem.removeEventListener(type, handle);
			}
		} :
		function(elem, type, handle) {
			var name = "on" + type;
			if (elem.detachEvent) {
				if (typeof elem[name] === "undefined") {
					elem[name] = null;
				}
				elem.detachEvent(name, handle);
			}
		};
	var pSubClass = {
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
				return elem.tagName && elem.tagName.toLowerCase() == "iframe" ? elem.contentDocument || elem.contentWindow.document : elem.childNodes && [].slice.call(elem.childNodes) || [];
			},
			_empty() {
				var element = this;
				[].slice.call(element.childNodes).forEach((e) => {
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
				else if (typeof value == "undefined" && mod.isPlainObject(name)) {
					for (var i in name) {
						then.setAttribute(i, name[i]);
						then[i] = name[i];
					}
				} else {
					return then.getAttribute(name);
				}
				return this;
			},
			_children(selector) {
				if (selector) {
					return [].slice.call(this.querySelectorAll(selector))
				} else {
					return [].slice.call(this.children);
				}
			},
			_removeAttr(name) {
				if (mod.isArray(name) || typeof name != "string" && "length" in name) {
					var n = [];
					for (var i = 0; i < name.length; i++) n.push(name[i].name);
					name = n.join(' ');
				}
				typeof name == "string" && (name = name.split(' '));
				name.forEach((n) => {
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
					[].slice.call(n.childNodes).forEach(function(b) {
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
					mod.has(then.className.split(' '), n) && (then.className = then.className.replace(new RegExp("\\s*" + n, "gim"), ""));
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
					then.className != "" && mod.has(then.className, n) ? then._removeClass(n) : then._addClass(n);
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
			},
			_query(selector) {
				var elems = mod.findNode(selector, this);
				mod.mixElement(elems);
				return elems;
			}
		},
		mod = {
			templates: {},
			tmplThesaurus: {},
			tmplAttributes: {},
			tmplTags: {},
			routes: {},
			eventData: [],
			Styles: {},
			_stores: {},
			diff: function(a, b) {
				var c = {};
				for (var i in b) {
					if (!(i in a)) c[i] = b[i];
				}
				return c;
			},
			toStyle(val) {
				let style = [];
				for (let name in val) name != "" && style.push(name.replace(/\s+/gim, "") + ":'" + val[name] + "'");
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
							elem._off(n)._on(n, value[n]);
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
			nextTick: function(obj, callback, args) {
				callback && callback.apply(obj, !mod.isArray(args) ? [args] : args);
				return obj;
			},
			createObject: function(obj, name, _class, callback) {
				Reflect.defineProperty(obj, name, {
					get: function() {
						return _class
					},
					set: function(newClassObject) {
						if (_class == newClassObject) return;
						var oldClass = _class;
						obj.watch && obj.watch[name] && (newClassObject = obj.watch[name].call(obj, newClassObject));
						obj.mixins && obj.mixins.forEach(function(n) {
							n.watch && n.watch[name] && (newClassObject = n.watch[name].call(obj, newClassObject));
						});
						_class = newClassObject;
						mod.nextTick(obj, callback, [name, _class, oldClass]);
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
						return "array" === c || 0 === len || "number" == typeof len && len > 0 && len - 1 in a;
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
					} else {
						for (var e in a)
							if (d = b.apply(a[e], c), d === !1) break
					}
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
				mod.isArray(element) ? element.forEach(function(n) {
					mod.extend(n, pSubClass);
				}) : mod.extend(element, pSubClass);
				element.children && element.children.length > 0 && [].slice.call(element.children).forEach(function(e) {
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
			stringify: function(obj) {
				if (null == obj)
					return "null";
				if ("string" != typeof obj && obj.toJSON)
					return obj.toJSON();
				var type = typeof obj;
				switch (type) {
					case "string":
						return '"' + obj.replace(/[\"\r\n\t\\]+/gim, ((a) => {
							return "\\\\" + a
						})) + '"';
					case "number":
						var ret = obj.toString();
						return /N/.test(ret) ? "null" : ret;
					case "boolean":
						return obj.toString();
					case "date":
						return "new Date(" + obj.getTime() + ")";
					case "array":
						for (var ar = [], i = 0; i < obj.length; i++)
							ar[i] = mod.stringify(obj[i]);
						return "[" + ar.join(",") + "]";
					case "object":
						if (mod.isPlainObject(obj)) {
							ar = [];
							for (var i in obj)
								ar.push('"' + i.replace(/[\"\r\n\t\\]+/gim, ((a) => {
									return "\\\\" + a
								})) + '":' + mod.stringify(obj[i]));
							return "{" + ar.join(",") + "}"
						}
				}
				return "null"
			},
			tmpl: function(obj, data) {
				var rp = function(name, val, _object) {
						if (typeof name == "string") {
							var reg = new RegExp("{{\\s*" + name + "\\s*(\\|\\s*([^<>,}]+)\\s*|([^{}]+)\\s*)*}}", "gim");
							if (typeof val != "undefined") {
								_object = _object.replace(reg, function(a, b) {
									if (b) {
										b = b.split(':');
										if (mod.tmplThesaurus[b[0].replace(/\s*\|\s*/gim, "").replace(/\s+/gim, "")]) {
											var c = mod.tmplThesaurus[b[0].replace(/\s*\|\s*/gim, "").replace(/\s+/gim, "")](val, b[1] && b[1].replace(/^\s+/gim, "") || undefined, name);
											a = typeof c != "undefined" ? c : a;
										} else if (/[\?\:><\=\!\+\-\*\/]+/.test(a)) {
											try {
												var d = new Function(name, "return " + a.replace(/&quot;/gim, "'").replace(/[{}]+/gim, "") + ";");
												var c = d(val);
												a = c;
											} catch (e) {
												console.log("->", e, reg, a, b, name, val)
											}
										}
									} else {
										a = val;
									}
									return a;
								});
							}
						}
						return _object;
					},
					bindAttrElement = {
						bind: {},
						for: {}
					};
				if (mod.is(typeof obj, "string")) {
					mod.each(data, function(n, v) {
						if (n != "created") {
							var u = v;
							if (typeof v == "function") {
								u = v();
							}
							if (mod.isPlainObject(u) && n.toLowerCase() == "computed") {
								mod.each(u, function(name, val) {
									obj = rp(name, val.call(data), obj);
									data.mixins && data.mixins[n.toLowerCase()] && (obj = rp(name, data.mixins[n.toLowerCase()][name].call(data), obj));
								});
							} else {
								obj = rp(n, u, obj);
							}
						}
					});
				} else if (obj.nodeType) {
					if (obj.tagName && mod.templates[obj.tagName.toLowerCase()]) {
						var attr = obj.attributes,
							newObj = {},
							mData = {};
						mod.each(attr, function(i, b) {
							if (b.name == "p-binddata") {
								obj.removeAttribute(b.name);
								if (b.value == "this") {
									!mod.isEmptyObject(data) && $.extend(newObj, data);
									"created" in newObj && delete newObj.created;
								} else {
									newObj[b.value] = data[b.value];
								}
							} else {
								newObj[b.name] = b.value;
							}
						});
						mData = mod.extend(mod.templates[obj.tagName.toLowerCase()].data, newObj);
						pTemplate.render(obj.tagName.toLowerCase(), mData, [pTemplate.createDom("div", {})], function(parent) {
							obj.parentNode && obj.parentNode.replaceChild(parent.children[0], obj);
						});
					} else {
						if (obj.tagName && mod.tmplTags && mod.tmplTags[obj.tagName.toLowerCase()]) {
							var newElem = mod.tmplTags[obj.tagName.toLowerCase()](obj, data);
							newElem && (obj.parentNode.replaceChild(newElem, obj), obj = newElem);
						}
						mod.mixElement(obj);
						var attrs = obj.attributes && obj.attributes.length > 0 && [].slice.call(obj.attributes) || false;
						if (attrs) {
							attrs.forEach(function(a) {
								if (!data || !mod.isEmptyObject(data)) {
									mod.each(data, function(n, v) {
										if (n != "created") {
											var u = v;
											if (typeof v == "function") {
												u = v();
											}
											if (mod.isPlainObject(u) && n.toLowerCase() == "computed") {
												mod.each(u, function(name, val) {
													a.value = rp(name, val.call(data), a.value);
													data.mixins && data.mixins[n.toLowerCase()] && (a.value = rp(name, data.mixins[n.toLowerCase()][name].call(data), a.value));
												});
											} else {
												a.value = rp(n, u, a.value);
											}
										}
									});
								}
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
									}
									obj._removeAttr(a.name);
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
						obj.children && mod.each([].slice.call(obj.children), function(i, e) {
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
				var that = this;
				eventName = eventName.split(' ');
				eventName.forEach((ev) => {
					var fn = (e) => {
							that.nextTick(then, callback, [e, args]);
						},
						eventObj = {
							element: then,
							eventName: ev,
							factory: fn
						};
					if (then.addEventListener) {
						then.addEventListener(ev, fn, bool || false);
					} else if (then.attachEvent) {
						then.attachEvent("on" + ev, fn);
					}
					mod.eventData.push(eventObj);
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
							removeEvent(then, ev, a.factory);
							mod.eventData.splice(i, 1);
						}
					})
				});
				return this;
			},
			trigger: function(then, eventName, args) {
				eventName = eventName.toLowerCase().split(' ');
				mod.each(eventName, function(n, ev) {
					triggerEvent(then, ev, args, null);
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
			isArray: function(obj) {
				return (Array.isArray || _instanceOf(Array))(obj);
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
			has: function(target, obj, filter) {
				var hasIn = false;

				if (mod.isArray(target)) {
					var i = -1;
					target.forEach((t) => {
						if (filter) {
							var r = filter(t, obj);
							if (r == true) hasIn = i + 1;
						} else {
							if (t === obj) hasIn = i + 1;
						}
						i += 1;
					});
					return hasIn;
				} else if (_instanceOf(String)) {
					var reg = new RegExp(obj, "gim");
					return reg.test(target);
				} else {
					for (var name in target) {
						if (typeof obj == "object" && target[name] == obj[name] || name == obj || target[name] == obj) hasIn = name;
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
				if (typeof selector == "string") {
					if (/^name=/.test(selector)) {
						var children = (element.getElementsByName ? element : doc).getElementsByName(selector.toLowerCase().replace(/^name=/gim, ""));
						if (children) {
							return [].slice.call(children);
						}
					} else if (/template\:/.test(selector)) {
						var nodes = element.querySelectorAll("[p-" + selector.replace(":", "=") + "]");
						return [].slice.call(nodes);
					} else if (/^tagname=/.test(selector)) {
						var children = element.getElementsByTagName && element.getElementsByTagName(selector.toLowerCase().replace(/^tagname=/gim, ""));
						if (children) {
							return [].slice.call(children);
						}
					} else if (/\[[^\[\]]+\]/.test(selector)) {
						var reg = /([^\[\]]+)\s*\[([^\[\]]+)\]/.exec(selector);
						if (reg) {
							var nodes = [];
							[].slice.call(element.querySelectorAll(reg[1])).forEach((e) => {
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
							[].slice.call(element.querySelectorAll(reg[1])).forEach((e) => {
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
					return [].slice.call(node);
				} else if (selector.nodeType) {
					return [selector];
				} else {
					return selector;
				}
			},
			pSubClass: pSubClass
		},
		hasOwn = {}.hasOwnProperty,
		_instanceOf = (_constructor) => {
			return function(o) {
				return (o instanceof _constructor);
			};
		};
	class Store {
		constructor(name, data) {
			mod.extend(this, {
				name: name,
				data: data
			});
			mod._stores[this.name] = this;
			return this;
		}
		commit(data) {
			mod._stores[this.name] && data && mod.extend(mod._stores[this.name].data, data);
			return this;
		}
		get(name) {
			if (name) {
				name = name.split(' ');
				var a = {};
				mod._stores[this.name] && mod.each(name, function(i, n) {
					a[n] = mod._stores[this.name].data[n];
				});
				return a;
			}else{
				return mod._stores[this.name].data;
			}
		}
		clear() {
			mod._stores[this.name].data = {};
			return this;
		}
		remove(name) {
			if (mod._stores[this.name] && name) {
				name = name.split(' ');
				mod.each(name, function(i, n){
					delete mod._stores[this.name].data[n];
				});
			} else {
				delete mod._stores[this.name];
			}
			return this;
		}
		clone(name) {
			return new Store(name, mod._stores[this.name].data);
		}
	}

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
					mod.nextTick(this, callback, []);
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
		router: function(params, callback) {
			!mod.routes && (mod.routes = {});
			if (typeof params != "undefined" && mod.isPlainObject(params)) {
				mod.extend(mod.routes, params);
				return this;
			} else if (typeof params != "undefined" && typeof params == "string") {
				params = params.split('?');
				mod.toArgs && mod.routes[params[0]] && mod.routes[params[0]].call(this, null, params[1] && mod.extend(mod.toArgs(params[1]) || undefined, {
					callback: callback
				}));
				return this;
			} else {
				return mod.routes;
			}
		},
		update: function(name, data) {
			var that = this;
			if (mod.templates[name]) {
				var a = mod.diff(mod.templates[name].data, data);
				mod.extend(mod.templates[name].data, data);
				if (!mod.isEmptyObject(a)) {
					mod.each(a, function(n, v) {
						mod.createObject(mod.templates[name].data, n, v, function() {
							mod.templates[name].reload && mod.templates[name].reload();
						});
					});
					mod.templates[name].reload && mod.templates[name].reload();
				}
			}
			return this;
		},
		clone: function(from, to) {
			var content = mod.templates[from].content;
			var toTmpl = {
				parent: undefined,
				content: content,
				data: {}
			};
			mod.templates[to] = toTmpl;
			return this;
		},
		createStyle: function(style) {
			if (mod.isPlainObject(style)) {
				for (let name in style) {
					if (!Reflect.has(mod.Styles, name))
						style[name] = mod.toStyle(style[name]);
					else {
						Reflect.deleteProperty(style, name);
						style[name] = mod.Styles[name];
					}
				}
				return mod.extend(mod.Styles, style);
			} else if (typeof style == "string") {
				return this.createDom("style", {
					html: style
				});
			}
		},
		store: function(name, data) {
			var args = arguments,
				len = args.length,
				that = this;
			if (len === 1) {
				return mod._stores[name].get();
			} else {
				return new Store(name, data);
			}
			return data;
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
			mod.mixElement(elem);
			return elem;
		},
		nextTick: function(obj, callback, args) {
			mod.nextTick(obj, callback, args);
			return this;
		},
		render: function(name, data, parent, callback) {
			var that = this,
				template, then = function(name) {
					if (name) {
						if (typeof name == "string") {
							if (/^\s*\<\s*[a-zA-Z]+\s*/.test(name)) {
								var elem = that.createDom("div", {
									html: name
								});
								template = [elem.children[0]];
								name = $.mixElement(elem.children[0])._attr("p-template");
								elem.children[0]._removeAttr("p-template");
								elem._remove();
							} else {
								var t = mod.findNode("template:" + name);
								template = !t || t.length > 0 ? t : mod.templates[name].content;
							}
						} else if (name.nodeType) {
							template = [name];
							name = name._attr("p-template");
						} else if (mod.isPlainObject(name) && "render" in name) {
							template = [name.render(that.createDom)];
							if (template) {
								name = template[0]._attr("p-template");
							}
						}
						if (typeof parent == "function") {
							callback = parent;
							parent = typeof template != "string" && template || mod.templates[name] && [mod.templates[name].parent] || [];
						} else if (!parent || parent.length === 0) {
							parent = typeof template != "string" && template || mod.templates[name] && [mod.templates[name].parent] || [];
						} else if (!mod.isArray(parent) && parent.nodeType) {
							parent = [parent];
						}
						if (parent && parent.length > 0 && parent[0]) {
							var next = function(data) {
								if (data.commit) {
									data = data.get();
								}
								(new Promise((resolve, reject) => {
									!mod.templates[name] && that.createTemplate(name, {
										parent: parent[0],
										content: template[0].innerHTML,
										data: data,
										callback: callback,
										reload: function() {
											that.render(name, data, parent, callback);
										}
									}, true) || mod.extend(mod.templates[name], {
										parent: parent[0],
										data: data,
										callback: callback,
										reload: function() {
											that.render(name, data, parent, callback);
										}
									});
									mod.each(mod.templates[name].data, function(n, val) {
										mod.createObject(mod.templates[name].data, n, val, function(a, b) {
											mod.templates[name].reload();
										})
									});
									var html = mod.tmpl(mod.templates[name].content, data || {});
									parent[0].nodeType === 11 ? parent[0].appendChild($.createDom("div", {
										html: html
									})) : parent[0].tagName.toLowerCase() == "body" ? parent[0]._append($.createDom("div", {
										html: html
									}).children[0]) : (parent[0].innerHTML = html);
									mod.tmpl(parent[0], data);
									resolve();
								})).then(function(r) {
									data.created ? that.nextTick(data, data.created, parent[0]) : that.nextTick(data, callback, parent[0]);
								});
							}
							mod.promise(data, next);
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