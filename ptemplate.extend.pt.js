/*!
 * ptemplatejs v1.0.0
 * @author yandong
 *
 * https://github.com/ereddate/ptemplatejs

	PT({
		router: {
			"/test": function(e, args) {
				console.log(args.title);
				$.update("my-main", {
					title: "test 2018"
				})
			}
		},
		store: {
			name: "my-main",
			state: {
				api: {
					getdata: "/"
				}
			},
			props: {
				title: "test"
			}
		},
		ready: function(data) {
			$.render("my-main", data.props, $.query("#app"))
		}
	})


 */
'use strict';
typeof window.pTemplate != "undefined" && (function(win, $) {

	var pt = function(options) {
		return new pt.fn.init(options);
	};
	pt.fn = pt.prototype = {
		init: function(options) {
			var then = this;
			var promise = new Promise((resolve, reject) => {
				try {
					$.extend((then.data = {}), options);
					$.router(then.data.router);
					var store = $.store(then.data.store.name || "PT_store", {});
					store.commit(then.data.store);
					typeof then.data.ready !== "undefined" ?
						then.data.ready(store, function(args) {
							resolve(then, args);
						}) : resolve(then);
				} catch (e) {
					reject(e)
				}
			});
			return promise;
		}
	};
	pt.fn.init.prototype = pt.fn;

	win.PT = pt;

})(window, pTemplate);