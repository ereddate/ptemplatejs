var a = require("../bin/pjs-loader"),
	templates = a.getData();

module.exports = {
	template: templates,
	configs: [{
		modules: {
			ver: "0.0.1",
			files: [{
				name: "app",
				modules: ["index","test"],
				ver: "0.0.1"
			},{
				name: "app.in",
				modules: ["test.template", "test.style"],
				ver: "0.0.1"
			}]
		}
	}]
}