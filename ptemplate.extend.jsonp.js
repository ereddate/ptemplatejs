/*!
 * ptemplatejs v1.0.0
 * @author yandong
 *
 * https://github.com/ereddate/ptemplatejs
 */
'use strict';
typeof window.pTemplate != "undefined" && (function(win, $) {
	$.jsonp = (url, data, ops) => {
		if (url == "") return;
		if (!data) data = "";
		var complete = function(result, success, error) {
				if (result && result.status === 1) {
					success && success(result.data || result, result.msg || "success.", result.code || 1, result);
				} else if (result && result.status === 0) {
					error && error(result.msg || "unknown error.", result.code || 0);
				} else {
					success && success(result);
				}
			},
			fail = function(error, msg) {
				error && error(msg || "unknown error.", 0);
			},
			jsonp = function(success, error) {
				var head = document.getElementsByTagName("head")[0],
					callback = "ptemplate_jsonp_" + (Math.random(10000) + "").replace(".", "");
				while (window[callback]) {
					callback = "ptemplate_jsonp_" + (Math.random(10000) + "").replace(".", "");
				}
				window[callback] = function(data) {
					window[callback] = null;
					document.getElementById(callback).parentNode.removeChild(document.getElementById(callback));
					try {
						data = data || new Function('return ' + data)();
						console.log(callback)
						complete(data, success, error);
					} catch (e) {
						fail(error, e.message);
					}
				};
				try {
					var script = document.createElement("script");
					head.appendChild(script);
					script.timeout = setTimeout(function() {
						if (window[callback] != null) {
							window[callback] = null;
							head.removeChild(document.getElementById(callback));
							fail(error, "timeout " + callback);
						}
					}, ops && ops.timeout || 5000);
					script.id = callback;
					script.src = url + (/\?/.test(url) ? "&" : "?") + (ops && ops.callback || "callback") + "=" + callback;
					script.onload = function(a) {
						//console.log(arguments)
					};
					script.onerror = function() {
						head.removeChild(this);
						window[callback] = null;
						fail(error);
					};
				} catch (e) {
					fail(error, e.message);
				}
			};
		return {
			done: function(success, error) {
				setTimeout(function() {
					new jsonp(success, error);
				}, 500);
				return this;
			}
		}
	}
})(this, pTemplate)