module.exports = {
	configs: [{
		projectName: "test",
		version: "0.0.1",
		modules: {
			files: [{
				"app.0.0.1": "./src/test/js/index.js",
				"app.in.0.0.1": "./src/test/js/index.in.js"
			}]
		}
	}, {
		projectName: "book",
		version: "0.0.1"
	}, {
		projectName: "pages",
		version: "0.0.1"
	}, {
		projectName: "hackernews",
		version: "0.0.1",
		build: {
			uglifyjs: true,
			css: {
				isfile: true
			}
		}
	}, {
		projectName: "famousman",
		version: "0.0.1",
		build: {
			uglifyjs: true,
			css: {
				isfile: true
			}
		}
	}]
}