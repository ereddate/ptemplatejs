define("components", [], (require, exports, module) => {
	exports.done = (callback) => {
		$.promise((resolve, reject) => {
			try {
				resolve({
					a: 1
				})
			} catch (e) {
				reject(e)
			}
		}).then((data) => {
			callback && callback($.components("test", data, ($.createTemplate("test_components_a", {
				content: $.createDom("div", {}, $.createDom("div", {
					cls: "a"
				}, $.createDom("a", {
					href: "javascript:;",
					'p-router:href': '/test?t=main',
					text: "Status1_{{a}}"
				})))
			}), "test_components_a"), ($.createTemplate("test_components_b", {
				content: $.createDom("div", {}, $.createDom("div", {
					cls: "b"
				}, $.createDom("a", {
					href: "javascript:;",
					'p-router:href': '/test?t=share',
					text: "Status2_{{a}}"
				})))
			}), "test_components_b")));
		}, (e) => {
			console.log(e);
		});
	}
});