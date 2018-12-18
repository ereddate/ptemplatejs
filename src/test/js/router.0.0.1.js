define("router", [], (require, exports, module) => {
	exports.done = (app) => {
		return $.router({
			"/test": (e, args) => {
				console.log(args);
				app().render(args ? args.t : "main");
			}
		});
	}
});