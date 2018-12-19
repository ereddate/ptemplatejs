module.exports = {
	parsePJSX: function(result, callback) {
		var doms = "a|div|p|span|h1|h2|h3|h4|h5|h6|article|aside|address|ul|li|header|footer|ol|menu|data|datalist|dd|dt|dl|form|input|textarea|label|nav|meta|link|script|select|option|section|strong|style|table|tbody|th|tr|td|caption|tfoot|thead|title|video|audio|img|em|button|template|textnode",
			reg = new RegExp("((<\\\s*(" + doms + ")\\\s*[^<>]*\\\s*>|)(\\\s*[\\\r\\\n\\\t]*\\\s*|)(<\\\s*(" + doms + ")\\\s*[^<>]*\\\s*>|<\\\s*(" + doms + ")\\\s*[^<>]*\\\s*\\\/\\\s*>)(\\\s*[\\\r\\\n\\\t]*\\\s*.*\\\s*[\\\r\\\n\\\t]*\\\s*<\\\s*\\\/\\\s*(" + doms + ")\\\s*>)*(\\\s*[\\\r\\\n\\\t]*\\\s*|)(<\\\s*\\\/\\\s*(" + doms + ")\\\s*[^<>]*\\\s*>|))+", "gim");
		result = result.replace(/"([^"]+)\s+>\s+([^"]+)"/gim, "\"$1 $more $2\"").replace(/"([^"]+)\s+<\s+([^"]+)"/gim, "\"$1 $less $2\"");
		result = result.replace(reg, function(a, b) {
			//console.log("-> ", a)
			if (/((\s*[\r\n\t]*\s*|)<\s*(area|br|col|embed|hr|img|input|link|meta|param)\s*[^<>]*\s*\/\s*>(\s*[\r\n\t]*\s*|))+/.test(a)) {
				a = a.replace(a, " $.DOM.div({html: '" + a.replace(/[\r\n\t]*/gim, "").replace(/([<>]+)\s*/gim, "$1").replace(/'/gim, "\\\'").replace(/"/gim, "\\\"") + "'})");
			} else {
				a = a.replace(a, " $.DOM.div({html: '" + a.replace(/[\r\n\t]*/gim, "").replace(/([<>]+)\s*/gim, "$1").replace(/'/gim, "\\\'").replace(/"/gim, "\\\"") + "'})._children()[0]");
			}
			return a;
		});
		result = result.replace(/"([^"]+)\s+\$more\s+([^"]+)"/gim, "\"$1 > $2\"").replace(/"([^"]+)\s+\$less\s+([^"]+)"/gim, "\"$1 < $2\"");
		return result;
	}
}