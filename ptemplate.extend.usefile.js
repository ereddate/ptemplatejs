/*!
 * ptemplatejs v1.0.0
 * @author yandong
 *
 * https://github.com/ereddate/ptemplatejs
 */
 'use strict';
typeof window.pTemplate != "undefined" && (function(win, $) {
	$.extend($.__mod__, {
		use: function(url, callback, ops){
			var type = /\.(js|css)\?*/.exec(url);
			if (type){
				var elem = $.createDom(type[1] == "css" ? "link" : "script", $.extend(type[1] == "css" ? {
					href: url,
					rel: "text/stylesheet",
					type: "text/css"
				} : {
					src: url
				}, ops || {}));
				elem._on("load error", function(e){
					callback && callback.call(this, e);
				});
				$.query("head")[0]._append(elem);
			}
		}
	});
	$.extend($, {
		use: function(url, callback, ops){
			if ($.Callbacks){
				var callbacks = new $.Callbacks();
				url = typeof url == "string" ? url.split(' ') : url;
				$.each(url, function(i, item){
					callbacks.add(function(next){
						$.useData && $.useData.alias[item] && (item = $.useData.base + $.useData.alias[item]);
						$.__mod__.use(item, function(){
							next();
						}, ops);
					});
				});
				callbacks.done(function(){
					callback && callback();
				});
			}
			return this;
		},
		useConfig: function(options){
			typeof $.useData == "undefined" && ($.useData = {
				alias:{},
				base: "./"
			});
			options && $.extend($.useData, options);
			return this;
		}
	});
})(window, pTemplate);