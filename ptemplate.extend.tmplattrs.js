/*!
 * ptemplatejs v1.0.0
 * @author yandong
 *
 * https://github.com/ereddate/ptemplatejs
 */
'use strict';
typeof window.pTemplate != "undefined" && (function(win, $) {
	function isExpress(a, data, name) {
		var isExpress = false,
			fn;
		try {
			fn = new Function(name, "return " + a.value);
			fn(data);
			isExpress = true;
		} catch (e) {
			isExpress = false;
		}
		return typeof isExpress != "undefined" && isExpress ? fn(data) : null;
	}
	$.__mod__.toArgs = function(result) {
		var b = {};
		result.split('&').forEach(function(n) {
			n = n.split('=');
			b[n[0]] = n[1];
		});
		return b;
	};
	$.__mod__.tmplAttributes && $.extend($.__mod__.tmplAttributes, {
		router: function(obj, type, a, data, _parent) {
			var routers = a.value.split('?');
			if ($.__mod__.routes && $.__mod__.routes[routers[0]]) {
				var result = $.__mod__.routes[routers[0]];
				if (Object.is(typeof result, "function")) {
					if (routers[1]) {
						routers[1] = $.__mod__.toArgs(routers[1], data);
					}
					obj._attr(type, a.value)._removeAttr(a.name);
					obj._off("click")._on("click", function(e, args) {
						this._targetData = data;
						e.preventDefault();
						result.call(this, e, args);
					}, routers[1]);
					return;
				}
				var params = $.__mod__.jsonToUrlString(result.params || {}, "&"),
					val = result.path + (params == "" ? "" : !/\?/.test(result.path) ? "?" : "&") + params;
				if (!type) {
					obj._data("_router", val);
				} else {
					obj._attr(type, val);
				}
				obj._removeAttr(a.name)
			}
		},
		style: function(obj, type, a, data, _parent) {
			switch (type) {
				case "json":
					try {
						var b = new Function("return" + a.value)();
						for (var n in b) {
							obj._css(n, b[n]);
						}
					} catch (e) {
						console.log("tmplAttributes_style_json_error: ", e)
					}
					break;
				case "text":
					var b = a.value.split(';');
					b.forEach(function(c) {
						if (c != "") {
							c = c.split(':');
							obj._css(c[0], c[1])
						}
					});
					break;
				case "express":
					var b = isExpress(a);
					b && (obj.style.cssText = b);
					break;
				case "class":
					var d = isExpress(a);
					if (d) {
						obj._addClass(d);
					} else {
						var b = a.value.split(' ');
						b.forEach(function(c) {
							if ($.getStyle(c)) {
								obj.style.cssText += $.getStyle(c);
							} else {
								obj._addClass(c)
							}
						});
					}
					break;
				default:
					obj.style.cssText = a.value;
					break;
			}
			obj._removeAttr(a.name)
		},
		express: function(obj, type, a, data, _parent) {
			switch (type) {
				case "for":
					var cmd = a.value.split(' '),
						then = function(result) {
							var html = obj._removeAttr("p-express:" + type).outerHTML,
								name = /\./.test(cmd[2]) ? cmd[2].split('.')[0] : cmd[2],
								f = pTemplate.createDom("docmentfragment", {}),
								t = 'var html =[];if(' + cmd[2] + '){var len = ' + cmd[2] + '.length;for (var ' + cmd[0] + '=0;' + cmd[0] + '<len;' + cmd[0] + '++){var x_data = ' + cmd[2] + '[' + cmd[0] + ']; html.push(pTemplate.tmpl(\'' + html.replace(/"/gim, "\\\"").replace(/'/gim, "\\\'").replace(/\r|\n/gim, "") + '\', x_data))}}return html;',
								r = new Function(name, t)(result[name] || {});
							if (_parent) {
								_parent.innerHTML = r.join('');
								$.__mod__.each([].slice.call(_parent.children), function(i, e) {
									$.query(e)[0]._attr("p-index", i + 1);
								});
								pTemplate.tmpl(_parent, data);
							}
						},
						findSubObject = function(obj, selector) {
							var r = obj;
							selector = selector.split('.');
							selector.forEach(function(s) {
								typeof r[s] != "undefined" && (r = r[s]);
							});
							return r;
						};
					var result = /\./.test(cmd[2]) ? findSubObject(data, cmd[2]) : data[cmd[2]];
					if (result) {
						if (typeof(result) == "function") {
							var b = new Promise((resolve, reject) => {
								data[cmd[2]](resolve, reject);
							});
							b.then(function(result) {
								then(result);
							}, function(error) {
								console.log(error || "error");
								then({});
							});
						} else {
							then(data);
						}
					}
					break;
				case "if":
					var index = parseInt(obj._attr("p-index")) || 0,
						result = isExpress(a, /index/.test(a.value) ? index : data, /index/.test(a.value) ? "index" : "data");
					if (!result) {
						result = new RegExp(a.value).test(obj._html());
					}
					if (!result) {
						_parent && _parent._remove(obj);
					} else {
						obj._removeAttr(a.name);
					}
					break;
			}
		},
		custom: function(obj, type, a, data, _parent) {
			var result = isExpress(a, data);
			obj._attr(type, !result ? a.value : result);
			obj._removeAttr(a.name);
		},
		html: function(obj, type, a, data, _parent) {
			var html = "",
				b = pTemplate.createDom("div", {});
			pTemplate.__mod__.templates[a.value] && (html = pTemplate.__mod__.templates[a.value].content);
			b.innerHTML = html;
			b.children[0] && obj._append(b.children[0]);
			obj._removeAttr(a.name);
		},
		handle: function(obj, type, a, data, _parent) {
			var handle = a.value.split(/\s*\:\s*/),
				type = type.split(/\./),
				filter = function(t, e) {
					switch (t[1]) {
						case "prevent":
							e.preventDefault();
							break;
						case "stop":
							e.stopPropagation();
							break;
					}
				},
				mixins = function(that, name, e, args) {
					data.mixins && data.mixins.handle && data.mixins.handle[name] && data.mixins.handle[name].call(that, e, args);
				};
			switch (type[0]) {
				case "watch":
					data.handle && (obj._on("DOMSubtreeModified", function(e) {
						if (e.target.nodeType === 1) {
							e.target._trigger && e.target._trigger("watch");
						}
					})._off(type[0])._on(type[0], function(e, args) {
						this._targetData = data;
						if (type[1]) {
							filter(type, e);
						}
						data.handle[handle[0]].call(this, e, args);
						mixins(this, handle[0], e, args);
					}, handle[1], type[1] == "capture" ? true : false, type[1] == "once" ? true : false), obj._removeAttr(a.name));
					break;
				case "keyup":
					if (data.handle) {
						if (type[1]) {
							obj._off(type.join('.'))._on(type.join('.'), function(e, args) {
								this._targetData = data;
								data.handle[handle[0]] && data.handle[handle[0]].call(this, e, args);
								mixins(this, handle[0], e, args);
							});
						}
						obj._off("keyup")._on("keyup", function(e, args) {
							this._targetData = data;
							var name = "";
							switch (e.keyCode) {
								case 13:
									name = "keyup.enter";
									break;
								case 27:
									name = "keyup.esc";
									break;
								case 32:
									name = "keyup.space";
									break;
								case 46:
									name = "keyup.delete";
									break;
								case 38:
									name = "keyup.up";
									break;
								case 40:
									name = "keyup.down";
									break;
								case 37:
									name = "keyup.left";
									break;
								case 39:
									name = "keyup.right";
									break;
								default:
									name = "keyup." + e.keyCode;
									break;
							}
							type[1] ? this._trigger(name) : (data.handle[handle[0]] && data.handle[handle[0]].call(this, e, args), mixins(this, handle[0], e, args));
						});
						obj._removeAttr(a.name);
					}
					break;
				case "tap":
				case "pinched":
				case "swipe":
					if ($.__mod__.touch && $.__mod__.touch[type[0]]) {
						switch (type[0]) {
							case "tap":
							case "pinched":
							case "swipe":
								$.__mod__.touch[type[0]](obj, function(e, args) {
									data.handle[handle[0]] && data.handle[handle[0]].call(this, e, args);
									mixins(this, handle[0], e, args);
								});
								break;
						}
					}
					break;
				default:
					data.handle && (obj._off(type[0])._on(type[0], function(e, args) {
						this._targetData = data;
						if (type[1]) {
							filter(type, e);
							if (type[1] == "self") {
								if (e.target == this) {
									data.handle[handle[0]] && data.handle[handle[0]].call(this, e, args);
									mixins(this, handle[0], e, args);
								}
								return;
							}
						}
						if (obj._data("_router")) {
							obj._attr(obj._has("href") ? "href" : "src", obj._data("_router"))
						} else {
							data.handle[handle[0]] && data.handle[handle[0]].call(this, e, args);
							mixins(this, handle[0], e, args);
						}
					}, handle[1], type[1] == "capture" ? true : false, type[1] == "once" ? true : false), obj._removeAttr(a.name));
					break;
			}
		}
	})
})(this, pTemplate)