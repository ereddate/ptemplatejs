define("test", [], function(require, exports, module){
	exports.done = function(callback){
		console.log("end");
		callback && callback();
	}
});