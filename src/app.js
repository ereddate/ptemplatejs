var a = require("../bin/pjs-loader"),
	templates = a.getData();
module.exports = {
	template: templates,
	configs: [{
		projectName: "test",
		modules: {
			ver: "0.0.1",
			files: [{
				name: "app",
				modules: ["index.script","test"],
				ver: "0.0.1"
			},{
				name: "app.in",
				modules: ["test.template", "test.style", "index.script"],
				ver: "0.0.1"
			}]
		}
	}]
}