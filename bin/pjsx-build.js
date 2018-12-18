module.exports = {
	parsePJSX: function(result, callback) {
		result = result.replace(/((\s*[\r\n\t]*\s*|)<\s*(area|br|col|embed|hr|img|input|link|meta|param)\s*[^<>]*\s*\/\s*>(\s*[\r\n\t]*\s*|))+/gim, function(a, b, c){
			console.log(a);
			a = a.replace(a, " $.DOM.div({html: '" + a.replace(/[\r\n\t]*/gim, "").replace(/([<>]+)\s*/gim, "$1").replace(/'/gim, "\\\'").replace(/"/gim, "\\\"") + "'})");
			return a;
		});
		result = result.replace(/((<\s*[^<>]+\s*>|)(\s*[\r\n\t]*\s*|)<\s*[^<>]+\s*>\s*[\r\n\t]*\s*.*\s*[\r\n\t]*\s*<\s*\/\s*[^<>]+\s*>(\s*[\r\n\t]*\s*|)(<\s*\/\s*[^<>]+\s*>|))+/gim, function(a, b) {
			console.log("-> ", a);
			a = a.replace(a, " $.DOM.div({html: '" + a.replace(/[\r\n\t]*/gim, "").replace(/([<>]+)\s*/gim, "$1").replace(/'/gim, "\\\'").replace(/"/gim, "\\\"") + "'})._children()[0]");
			return a;
		});
		return result;
	}
}