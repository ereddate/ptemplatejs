/*!
 * ptemplatejs v1.0.0
 * @author yandong
 *
 * https://github.com/ereddate/ptemplatejs

	var dplus = $.Dplus(["//utrack.hexun.com/dp/dplus_config_ver1.0.1.js", "//utrack.hexun.com/dp/hexun_dplus_ver1.0.1.js"], {
		pagename: ''
	}, function(){
		...
	});

	dplus.click('.elem', {
		pagename: ''
	}, function(){
		...
	});

 */
'use strict';
typeof window.pTemplate != "undefined" && (function(win, $) {

	$.Dplus = function(urlArray, options, callback) {
		$.use(urlArray, function() {
			window.dplus_pageview = false;
			if (options){
				var callbacks = $.Callbacks();
				callbacks.add(function(next) {
					typeof dplus_Click !== "undefined" && dplus_Click("页面浏览", options);
					next();
				}).delay(200, function(next) {
					callback && callback();
					next();
				}).done();
			}
		});
		return {
			init: function(ops){
				console.log(ops);
				typeof dplus_Click !== "undefined" && dplus_Click("页面浏览", ops);
				return this;
			},
			click: function(selector, options, callback) {
				$.query(selector)[0]._click(function(e) {
					e.preventDefault();
					var callbacks = $.Callbacks();
					callbacks.add(function(next) {
						typeof dplus_Click !== "undefined" && dplus_Click("点击事件", options);
						next();
					}).delay(200, function(next) {
						callback && callback();
						next();
					}).done();
				});
				return this;
			}
		}
	};

})(window, window.pTemplate);