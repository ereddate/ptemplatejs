/*!
 * ptemplatejs v1.0.0
 * @author yandong
 *

	var too = $.Status("#app", {
		template: {
			basePage: $.query("#too")[0]
		},
		store: {
			state: {
				api: {}
			},
			props: {},
			debug: false
		},
		router: {
			"/next": (e, args) => {
				$.use("statusMod", () => {
					define((require, exports, module) => {
						var a = require("statusMod");
						a.done();
						args.n && too.render(args.n);
					});
				});
			}
		},
		useConfig: {
			alias:{
				statusMod: "status_demo.js"
			},
			base: "http://192.168.10.47/other/"
		}
	}).set({
		just: {
			b: 1,
			a: 1,
			handle:{
				toohandleclick: (e) => {
					too.render("process");
				}
			}
		},
		process: {
			b: 2,
			a: 2,
			handle:{
				toohandleclick: (e) => {
					too.render("complete");
				}
			}
		},
		complete: {
			b: 3,
			a: 3,
			handle:{
				toohandleclick: (e) => {
					too.render("just");
				}
			}
		}
	}).render("just");

 * https://github.com/ereddate/ptemplatejs
 */
'use strict';
typeof window.pTemplate != "undefined" && ((win, $) => {
	
	class Status {
		constructor(baseParent, props) {
			this.data = {};
			this.base = baseParent || "body";
			if (props){
				if (props.template){
					this.template = props.template;
				}
				if (props.renderDom && typeof props.renderDom === "function"){
					this.renderHandle = props.renderDom;
				}
				if (props.store){
					this.store = $.store("my-main", props.store);
				}
				if (props.router){
					this.router = (params, callback) => {
						var args = arguments,
							len = args.length;
						if (len === 0){
							return props.router;
						}
						$.router(params, callback);
						return this;
					};
					$.router(props.router);
				}
				if (props.useConfig){
					$.useConfig && $.useConfig(props.useConfig);
				}
			}
			return this;
		}
		get(name){
			return this.data[name];
		}
		set(/* name, value */){
			var args = arguments,
				len = args.length;

			if (len === 1){
				$.extend(this.data, args[0]);
			}else{
				$.extend(this.data[args[0]] || (this.data[args[0]] = {}), args[1]);
			}

			return this;
		}
		render(name){
			if (this.data[name]){
				var data = $.extend(this.store && this.store.get("props") || this.store || {}, this.data[name]);
				if (this.renderHandle){
					this.renderHandle.call(this, data, this.store);
				}else if (this.template && this.template.basePage){
					$.render(typeof this.template.basePage === "string" && $.query(this.template.basePage)[0] || this.template.basePage, data, $.query(this.base));
				}
			}
			return this;
		}
		update(callback){
			this.renderHandle = callback;
			return this;
		}
	}

	$.Status = (base, props) => {
		return new Status(base, props);
	}

})(window, pTemplate);