/*!
 * ptemplatejs v1.0.0
 * @author yandong
 *
 * https://github.com/ereddate/ptemplatejs
 */
'use strict';
(function(win, $) {
	var doc = win.document;
	var createObject = function(obj, name, _class, callback) {
			Reflect.defineProperty(obj, name, {
				get: function() {
					return _class
				},
				set: function(newClassObject) {
					if (_class == newClassObject) return;
					var oldClass = _class;
					_class = newClassObject;
					callback.call(obj, name, _class, oldClass);
				}
			});
		},
		tmplattr = $.tmplattr = {
			handle: function(elem, type, a, data) {
				var name = a.value;
				$(elem).off(type).on(type, function(e) {
					data.handle && data.handle[name].call(this, e);
				}).removeAttr(a.name);
			}
		},
		tmpl = function(elem, data) {
			$.each(data, function(name, value) {
				var html = elem.html();
				html = html.replace(new RegExp("{{\\s*" + name + "\\s*}}", "gim"), function(a, b) {
					a = value;
					return a;
				});
				elem.html(html);
			});
			elem.children.length > 0 && $(elem).children().each(function(i, e) {
				var attr = e.attributes;
				[].slice.call(attr).forEach(function(a) {
					if (/^p-/.test(a.name)) {
						var n = a.name.replace("p-", "").split(':');
						tmplattr[n[0]] && tmplattr[n[0]](e, n[1], a, data);
					}
				});
			});
		},
		setFontSize = function(num) {
			var num = num || 16,
				iWidth = document.documentElement.clientWidth,
				iHeight = document.documentElement.clientHeight,
				fontSize = window.orientation && (window.orientation == 90 || window.orientation == -90) || iHeight < iWidth ? iHeight / num : iWidth / num;
			window.baseFontSize = fontSize;
			document.getElementsByTagName('html')[0].style.fontSize = fontSize.toFixed(2) + 'px';
			return fontSize;
		},
		setAttrs = function(elem, name, value) {
			switch (name) {
				case "text":
					if (typeof value == "function") {
						var r = value.call(elem, name);
						setAttrs(elem, name, r);
					} else if (typeof value == "string" && elem.nodeType != 11) {
						$(elem).text(value)
					} else {
						var textnode = doc.createTextNode(value);
						elem.appendChild(textnode);
					}
					break;
				case "html":
					value = typeof value == "function" ? value.call(elem, name) : value;
					$(elem).html(value);
					break;
				case "class":
					$(elem).addClass(value);
					break;
				case "handle":
					for (var n in value) {
						$(elem).off(n).on(n, value[n]);
					}
					break;
				case "css":
					elem.style.cssText = value;
					break;
				default:
					$(elem).attr(name, value);
					break;
			}
		};
	var templates = {};
	$.renderDom = function(selector, data, parent, callback) {
		if (arguments.length == 3) {
			callback = parent;
			parent = undefined;
		}
		var dom = $("[p-template=" + selector + "]"),
			template = templates[selector] && templates[selector].template || dom.html();
		!templates[selector] && (templates[selector] = {
			selector: selector,
			template: template,
			data: data
		});
		dom.html(template);
		tmpl(dom, data);
		$.each(templates[selector].data, function(n, value) {
			createObject(templates[selector].data, n, value, function() {
				$.renderDom(selector, data, parent, callback);
			});
		});
		callback && callback();
		return this;
	};
	$.updateDom = function(selector, data, callback) {
		$.extend(templates[selector].data, data);
		return this;
	};
	$.createTemplate = function(selector) {
		var dom = $("[p-template=" + selector + "]"),
			template = templates[selector] && templates[selector].template || dom.html();
		!templates[selector] && (templates[selector] = {
			selector: selector,
			template: template,
			data: null
		});
		return this;
	};
	$.cloneTemplate = function(a, b) {
		var c = templates[a] && $.extend($.extend({}, templates[a]), {
			selector: b
		});
		if (c) templates[b] = c;
		return this;
	};
	$.createDom = function() {
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
			for (var name in attrs) {
				var value = attrs[name];
				setAttrs(tag, name, value);
			}
		}
		childrens.forEach(function(e) {
			if (typeof e == "function") {
				var items = e();
				tag.appendChild(items);
			} else {
				tag.appendChild(e);
			}
		});
		return tag;
	};
	$.setBaseFontSize = function(num) {
		setFontSize(num);
		$(win).on("orientationchange resize", function() {
			setFontSize(num);
		});
		return this;
	};
	$.tmpl = tmpl;
	var routers = $.routers = {},
		toArgs = function(result) {
			if (!result) {
				return;
			}
			var b = {};
			var r = result.split('&');
			r.forEach(function(n) {
				n = n.split('=');
				b[n[0]] = n[1];
			});
			return b;
		};
	$.extend($.tmplattr, {
		router: function(elem, type, a, data) {
			var name = a.value.split('?');
			$(elem).attr(type, a.value).on("click", function(e) {
				e.preventDefault();
				$.routers[name[0]] && $.routers[name[0]].call(this, e, toArgs(name[1]));
			}).removeAttr(a.name);
		}
	});
	$.router = function(args) {
		if (typeof args == "string") {
			args = args.split('?');
			routers[args] && routers[args](null, toArgs(args[1]));
		} else {
			$.extend(routers, args);
		}
		return this;
	};
})(this, jQuery);
