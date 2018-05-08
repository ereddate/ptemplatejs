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
			$.extend(this, options);
			$.router(this.router);
			var store = $.store(this.store.name || "PT_store", {});
			store.commit(this.store);
			var then = this;
			typeof this.ready !== "undefined" && $.ready(function() {
				then.ready(store.get());
			});
			return this;
		}
	};
	pt.fn.init.prototype = pt.fn;

	win.PT = pt;

})(window, pTemplate);
