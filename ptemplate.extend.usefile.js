/*!
 * ptemplatejs v1.0.0
 * @author yandong
 *
	$.useConfig({
		alias:{
			test: 'test.0.0.1.js'
		},
		base: '//localhost/js/'
	});

	define((require, exports, module) => {
		$.use('test', () => {
			var test = require('test');
			test.done();	
		})
	});

 * https://github.com/ereddate/ptemplatejs
 */
'use strict';
typeof window.pTemplate != "undefined" && (function(win, $) {
	var useData = {
		alias: {},
		base: "./"
	};
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
			}else{
				var elem = $.DOM.img({src:url, id: "randomMarker", style: "display:none"});
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
						if (useData && useData.alias[item] && useData.alias[item].status > 0) {
							next();
						} else {
							var itemUrl = useData && useData.alias[item] ? useData.base + useData.alias[item].url : item;
							$.__mod__.use(itemUrl, function() {
								if (useData) {
									useData.alias[item] && $.extend(useData.alias[item], {
										status: 1
									}) || $.extend((useData.alias[item] = {
										url: item,
										status: 0,
										result: undefined
									}), {
										status: 2
									});
								}
								next();
							}, ops);
						}
					});
				});
				callbacks.done(function() {
					callback && callback();
				});
			}
			return this;
		},
		useConfig: function(options) {
			typeof useData == "undefined" && (useData = {
				alias: {},
				base: "./"
			});
			if (!options) {
				return useData;
			}
			if (options.alias) {
				$.each(options.alias, function(name, value) {
					!useData.alias[name] && (useData.alias[name] = $.extend({}, {
						url: value,
						status: 0,
						result: undefined
					}));
				});
			}
			options.base && (useData.base = options.base);
			return this;
		}
	});

	win.define = function() {
		var args = arguments,
			len = args.length,
			require = function(name) {
				return useData.alias && useData.alias[name].result || null;
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
						$.each(useData.alias, function(n, v) {
							args[1][i] === n && $.extend(a, {
								[n]: v.result
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
					$.each(useData.alias, function(n, v) {
						args[1][i] === n && $.extend(a, v.result);
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
		typeof args[0] === "string" && $.extend(useData.alias[args[0]] && useData.alias[args[0]].result || (!useData.alias[args[0]] && (useData.alias[args[0]] = {
			url: '',
			status: 0,
			result: {}
		}) && useData.alias[args[0]].result) || (useData.alias[args[0]].result = {}), $.__mod__.isPlainObject(exports) && exports || $.__mod__.isPlainObject(module) && module) && $.extend(useData.alias[args[0]], {
			status: 2
		});
	}

})(window, pTemplate);