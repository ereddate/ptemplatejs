var less = require("less"),
	cleanCSS = require('clean-css'),
	fs = require("fs"),
	path = require('path'),
	parseLessCount = 0,
	parseStyleCount = 0,
	parseSingleElemCount = 0,
	parsePairElemCount = 0;

function toBase64(c) {
	c = c.replace(/url\s*\(\s*['"]*([^'"]+)['"]*\s*\)\s*/gim, function(a, b) {
		a = a.replace(b, "data:font/embedded-opentype;charset=utf-8;base64," + fs.readFileSync(path.resolve(b.replace(/\s*\_base64/, ""))).toString("base64"));
		return a;
	});
	return c;
}

function parseLess(c) {
	less.render(c, function(e, output) {
		if (e) {
			console.log(e);
		}
		var text = output.css;
		text = (new cleanCSS({}).minify(text)).styles;
		text = toBase64(text);
		c = "<style>" + text + "</style>";
	});
	return c;
}
module.exports = {
	parsePJSX: function(result, callback) {
		var doms = "a|div|p|span|h1|h2|h3|h4|h5|h6|article|aside|address|ul|li|header|footer|ol|menu|data|datalist|dd|dt|dl|form|input|textarea|label|nav|meta|link|script|select|option|section|strong|style|table|tbody|th|tr|td|caption|tfoot|thead|title|video|audio|img|em|button|template|textnode",
			reg = new RegExp("((\\\@lessParse\\\(|\\\(|)<\\\s*style\\\s*>\\\s*[^<>]*\\\s*<\\\s*\\\/style\\\s*>\\\)*|(<\\\s*(" + doms + ")\\\s*[^<>]*\\\s*>|)(\\\s*[\\\r\\\n\\\t]*\\\s*|)(<\\\s*(" + doms + ")\\\s*[^<>]*\\\s*>|<\\\s*(" + doms + ")\\\s*[^<>]*\\\s*\\\/\\\s*>)(\\\s*[\\\r\\\n\\\t]*\\\s*.*\\\s*[\\\r\\\n\\\t]*\\\s*<\\\s*\\\/\\\s*(" + doms + ")\\\s*>)*(\\\s*[\\\r\\\n\\\t]*\\\s*|)(<\\\s*\\\/\\\s*(" + doms + ")\\\s*[^<>]*\\\s*>|))+", "gim");
		result = result.replace(/"([^"]+)\s+>(\=*)\s+([^"]+)"/gim, "\"$1 #more$2 $3\"").replace(/"([^"]+)\s+<(\=*)\s+([^"]+)"/gim, "\"$1 #less$2 $3\"");
		result = result.replace(reg, function(a, b) {
			//console.log("-> ", a)
			if (/\@lessParse\(<\s*style\s*>\s*[^<>]*\s*<\s*\/style\s*>\)*/.test(a)) {
				a = a.replace(/\@lessParse\(<\s*style\s*>\s*([^<>]*)\s*<\s*\/style\s*>\)*/gim, function(b, c) {
					parseLessCount += 1;
					return parseLess(c);
				});
			} else if (/\(<\s*style\s*>\s*[^<>]*\s*<\s*\/style\s*>\)/.test(a)) {
				parseStyleCount += 1;
				a = a.replace(/^\(/gim, "").replace(/\)$/gim, "");
				a = toBase64(a);
			}
			if (/((\s*[\r\n\t]*\s*|)<\s*(area|br|col|embed|hr|img|input|link|meta|param)\s*[^<>]*\s*\/\s*>(\s*[\r\n\t]*\s*|))+/.test(a)) {
				parseSingleElemCount += 1;
				a = a.replace(a, " $.DOM.div({html: '" + a.replace(/[\r\n\t]*/gim, "").replace(/([<>]+)\s*/gim, "$1").replace(/\\/gim, "\\\\").replace(/'/gim, "\\\'").replace(/"/gim, "\\\"") + "'})");
			} else {
				parsePairElemCount += 1;
				a = a.replace(a, " $.DOM.div({html: '" + a.replace(/[\r\n\t]*/gim, "").replace(/([<>]+)\s*/gim, "$1").replace(/\\/gim, "\\\\").replace(/'/gim, "\\\'").replace(/"/gim, "\\\"") + "'})._children()[0]");
			}
			return a;
		});
		console.log("[parsed] ".green, "less.".yellow + parseLessCount, "style.".yellow + parseStyleCount, "singleElem.".yellow + parseSingleElemCount, "pairElem.".yellow + parsePairElemCount);
		result = result.replace(/"([^"]+)\s+\#more(\=*)\s+([^"]+)"/gim, "\"$1 >$2 $3\"").replace(/"([^"]+)\s+\#less(\=*)\s+([^"]+)"/gim, "\"$1 <$2 $3\"");
		return result;
	}
}