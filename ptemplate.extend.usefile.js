/*!
 * ptemplatejs v1.0.0
 * @author yandong
 *
 * https://github.com/ereddate/ptemplatejs
 */
'use strict';
typeof window.pTemplate != "undefined" && (function(win, $) {
	$.extend($.__mod__, {
		use: function(url, callback, ops) {
			var type = /\.(js|css)\?*/.exec(url),
				lastArg = (/\?/.test(url) ? "&" : "?") + "t=ptemplatejs_use_" + (Math.random(10000) + "").replace(/\./gim, "");
			if (type) {
				var elem = $.createDom(type[1] == "css" ? "link" : "script", $.extend(type[1] == "css" ? {
					href: url + lastArg,
					rel: "text/stylesheet",
					type: "text/css"
				} : {
					src: url + lastArg
				}, ops || {}));
				elem._on("load error", function(e) {
					callback && callback.call(this, e);
				});
				$.query("head")[0]._append(elem);
			}
		}
	});
	$.extend($, {
		use: function(url, callback, ops) {
			if ($.Callbacks) {
				var callbacks = new $.Callbacks();
				url = typeof url == "string" ? url.split(' ') : url;
				$.each(url, function(i, item) {
					callbacks.add(function(next) {
						$.useData && $.useData.alias[item] ? (item = $.useData.base + $.useData.alias[item]) : item;
						$.__mod__.use(item, function() {
							next();
						}, ops);
					});
				});
				callbacks.done(function() {
					callback && callback();
				});
			}
			return this;
		},
		useConfig: function(options) {
			typeof $.useData == "undefined" && ($.useData = {
				alias: {},
				base: "./"
			});
			options && $.extend($.useData, options);
			return this;
		}
	});

	$.define_data = {};
	win.define = function() {
		var args = arguments,
			len = args.length,
			require = function(name) {
				return $.define_data[name] || null;
			},
			exports = {},
			module = {};
		switch (len) {
			case 2:
				if (typeof args[0] === "string") {
					args[1](require, exports, module);
				} else {
					var a = {};
					$.each(args[0], function(i, b) {
						$.each($.define_data, function(n, v) {
							args[1][i] === n && $.extend(a, {
								[n]: v
							});
							return false;
						});
					});
					exports = module = a;
					args[1](require, exports, module);
				}
				break;
			case 3:
				var a = {};
				$.each(args[1], function(i, b) {
					$.each($.define_data, function(n, v) {
						args[1][i] === n && $.extend(a, v);
						return false;
					});
				});
				exports = module = a;
				args[2](require, exports, module);
				break;
			default:
				args[0](require, exports, module);
				break;
		}
		typeof args[0] === "string" && $.extend($.define_data[args[0]] || ($.define_data[args[0]] = {}), $.__mod__.isPlainObject(exports) && exports || $.__mod__.isPlainObject(module) && module);
	}

})(window, pTemplate);