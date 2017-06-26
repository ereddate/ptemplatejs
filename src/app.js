var a = require("../bin/pjs-loader"),
	templates = a.getData();
module.exports = {
	template: templates,
	configs: [{
		projectName: "test",
		version: "0.0.1",
		modules: {
			files: [{
				"app.0.0.1": "./src/test/js/index.js",
				"app.in.0.0.1": "./src/test/js/index.in.js"
			}]
		}
	}]
}