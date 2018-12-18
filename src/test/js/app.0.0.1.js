$.setBaseFontSize(16);
$.useConfig({
	alias: {
		router: "router.0.0.1.js",
		index: "main_index.0.0.1.js",
		api: "api.0.0.1.js",
		components: "components.0.0.1.js"
	},
	base: "//192.168.10.47/other/dist/test/js/0.0.1/"
});
define((require, exports, module) => {
	$.use("router api", () => {
		var app = $.Status("#app", {
			store: {
				state: {
					api: require("api").done(true)
				},
				props: {}
			},
			router: require('router').done(() => {
				return app;
			}),
			renderDom(data) {
				$.use("index", () => {
					require("mymain").done(data, app);
				});
			}
		}).set({
			main: {
				props: {
					status: 1,
					tabsLen: 3,
					tabsItem_left: "left",
					tabsItem_center: "center",
					tabsItem_right: "right"
				},
				handle: {
					componentWillMount: (next) => {
						console.log("componentWillMount1");
						next();
					},
					componentDidMount: (next) => {
						console.log("componentDidMount1");
						next();
					}
				},
				created: (elem) => {
					console.log("created1", elem);
				}
			},
			share: {
				props: {
					status: 2,
					tabsLen: 2,
					tabsItem_left: "left",
					tabsItem_right: "right"
				},
				handle: {
					componentWillMount: (next) => {
						console.log("componentWillMount2");
						next();
					},
					componentDidMount: (next) => {
						console.log("componentDidMount2");
						next();
					}
				},
				created: (elem) => {
					console.log("created2", elem);
				}
			}
		}).render("main");
	});
});