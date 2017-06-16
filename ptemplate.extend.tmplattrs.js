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
		return isExpress ? fn(data) : null;
	}
	$.__mod__.tmplAttributes && $.extend($.__mod__.tmplAttributes, {
		router: function(obj, type, a, data, _parent) {
			if ($.__mod__.routes && $.__mod__.routes[a.value]) {
				var result = $.__mod__.routes[a.value];
				if (Object.is(typeof result, "function")) {
					result = result();
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
		express: function(obj, type, a, data, _parent) {
			switch (type) {
				case "for":
					var cmd = a.value.split(' '),
						then = function(result) {
							var html = obj._removeAttr("p-express:" + type).outerHTML,
								//parent = obj.parentNode,
								f = pTemplate.createDom("docmentfragment", {}),
								t = 'var html =[], len = ' + cmd[2] + '.length;for (var ' + cmd[0] + '=0;' + cmd[0] + '<len;' + cmd[0] + '++){html.push(pTemplate.createDom("div", {"p-index": ' + cmd[0] + '+1,html:pTemplate.tmpl(\'' + html.replace(/\r|\n/gim, "") + '\', ' + cmd[2] + '[' + cmd[0] + '])}))}return html;',
								r = new Function(cmd[2], t)(result[cmd[2]] || {});
							r.forEach(function(e) {
								f.appendChild(pTemplate.__mod__.mixElement(e.children[0])._attr("p-index", e._attr("p-index")));
							});
							pTemplate.tmpl(f, result);
							if (_parent) {
								_parent.innerHTML = "";
								_parent.appendChild(f);
							}
						};
					if (data[cmd[2]]) {
						if (typeof(data[cmd[2]]) == "function") {
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
					//console.log(a.value, result, obj._html())
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
			var result = isExpress(a);
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
				}
			switch (type[0]) {
				case "watch":
					data.handle && (obj._on("DOMSubtreeModified", function(e) {
						if (e.target.nodeType === 1) {
							e.target._trigger && e.target._trigger("watch");
						}
					})._on(type[0], function(e, args) {
						if (type[1]) {
							filter(type, e);
						}
						data.handle[handle[0]].call(this, e, args)
					}, handle[1], type[1] == "capture" ? true : false, type[1] == "once" ? true : false), obj._removeAttr(a.name));
					break;
				default:
					data.handle && (obj._on(type[0], function(e, args) {
						if (type[1]) {
							filter(type, e);
						}
						if (obj._data("_router")){
							obj._attr(obj._has("href") ? "href" : "src", obj._data("_router"))
						}
						data.handle[handle[0]].call(this, e, args)
					}, handle[1], type[1] == "capture" ? true : false, type[1] == "once" ? true : false), obj._removeAttr(a.name));
					break;
			}
		}
	})
})(this, pTemplate)