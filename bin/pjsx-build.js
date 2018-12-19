module.exports = {
	parsePJSX: function(result, callback) {
		result = result.replace(/"([^"]+)\s+>\s+([^"]+)"/gim, "\"$1 $more $2\"").replace(/"([^"]+)\s+<\s+([^"]+)"/gim, "\"$1 $less $2\"");
		result = result.replace(/((<\s*[^<>]+\s*>|)(\s*[\r\n\t]*\s*|)(<\s*[^<>]+\s*>|<\s*[^<>]+\s*\/\s*>)(\s*[\r\n\t]*\s*.*\s*[\r\n\t]*\s*<\s*\/\s*[^<>]+\s*>)*(\s*[\r\n\t]*\s*|)(<\s*\/\s*[^<>]+\s*>|))+/gim, function(a, b) {
			if (/((\s*[\r\n\t]*\s*|)<\s*(area|br|col|embed|hr|img|input|link|meta|param)\s*[^<>]*\s*\/\s*>(\s*[\r\n\t]*\s*|))+/.test(a)){
				a = a.replace(a, " $.DOM.div({html: '" + a.replace(/[\r\n\t]*/gim, "").replace(/([<>]+)\s*/gim, "$1").replace(/'/gim, "\\\'").replace(/"/gim, "\\\"") + "'})");
			}else{
				a = a.replace(a, " $.DOM.div({html: '" + a.replace(/[\r\n\t]*/gim, "").replace(/([<>]+)\s*/gim, "$1").replace(/'/gim, "\\\'").replace(/"/gim, "\\\"") + "'})._children()[0]");
			}
			return a;
		});
		result = result.replace(/"([^"]+)\s+\$more\s+([^"]+)"/gim, "\"$1 > $2\"").replace(/"([^"]+)\s+\$less\s+([^"]+)"/gim, "\"$1 < $2\"");
		return result;
	}
}