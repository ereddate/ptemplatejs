var a = require("../bin/pjs-loader"),
	templates = a.getData();
module.exports = {
	template: templates,
	configs: [{
		projectName: "test",
		version: "0.0.1",
		modules: {
			files: [{
				name: "app",
				modules: ["index.script", "test"],
				version: "0.0.1"
			}, {
				name: "app.in",
				modules: ["test.template", "test.style", "index.script"],
				version: "0.0.1"
			}]
		}
	}]
}