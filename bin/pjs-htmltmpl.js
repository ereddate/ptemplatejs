var hasOwn = ({}).hasOwnProperty,
	rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;

function isEmptyObject(obj) {
	var name;
	for (name in obj) {
		return false;
	}
	return true;
}

function trim(text) {
	return text == null ?
		"" :
		(text + "").replace(rtrim, "");
}

function isPlainObject(obj) {
	var key;

	// Must be an Object.
	// Because of IE, we also have to check the presence of the constructor property.
	// Make sure that DOM nodes and window objects don't pass through, as well
	if (!obj || !is("object", obj)) {
		return false;
	}

	try {
		// Not own constructor property must be Object
		if (obj.constructor &&
			!hasOwn.call(obj, "constructor") &&
			!hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
			return false;
		}
	} catch (e) {
		// IE8,9 Will throw exceptions on certain host objects #9897
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	for (key in obj) {}

	return key === undefined || hasOwn.call(obj, key);
}

function is(str, obj) {
	var bool = false;
	bool = _getConstructorName(obj).toLowerCase() === str.toLowerCase();
	return bool;
}

function _getConstructorName(o) {
	//加o.constructor是因为IE下的window和document
	if (o != null && o.constructor != null) {
		return Object.prototype.toString.call(o).slice(8, -1);
	} else {
		return '';
	}
}

function _mulReplace(s, arr) {
	for (var i = 0; i < arr.length; i++) {
		s = s.replace(arr[i][0], arr[i][1]);
	}
	return s;
}

function _escapeChars(s) {
	return _mulReplace(s, [
		[/\\/g, "\\\\"],
		[/"/g, "\\\""],
		//[/'/g, "\\\'"],//标准json里不支持\后跟单引号
		[/\r/g, "\\r"],
		[/\n/g, "\\n"],
		[/\t/g, "\\t"]
	]);
}

function _type(obj, bool) {
	var type = _getConstructorName(obj).toLowerCase();
	if (bool) return type;
	switch (type) {
		case 'string':
			return '"' + _escapeChars(obj) + '"';
		case 'number':
			var ret = obj.toString();
			return /N/.test(ret) ? 'null' : ret;
		case 'boolean':
			return obj.toString();
		case 'date':
			return 'new Date(' + obj.getTime() + ')';
		case 'array':
			var ar = [];
			for (var i = 0; i < obj.length; i++) {
				ar[i] = _stringify(obj[i]);
			}
			return '[' + ar.join(',') + ']';
		case 'object':
			if (isPlainObject(obj)) {
				ar = [];
				for (i in obj) {
					ar.push('"' + _escapeChars(i) + '":' + _stringify(obj[i]));
				}
				return '{' + ar.join(',') + '}';
			}
	}
	return 'null'; //无法序列化的，返回null;
}

function _capitalize(val) {
	return val[0].toUpperCase() + val.substr(1);
}

function _stringify(obj) {
	if (obj == null) {
		return 'null';
	}
	if (obj.toJSON) {
		return obj.toJSON();
	}
	return _type(obj);
}

function _tmplFilterVal(val, filterCondition) {
	if (is("function", filterCondition)) {
		return filterCondition(val);
	} else if (is("object", filterCondition)) {
		if (isPlainObject(filterCondition)) {
			for (name in filterCondition) {
				var oval = filterCondition[name];
				var oreg = new RegExp(oval, "igm");
				if (oreg.test(val)) {
					return val.replace(oreg, "");
				}
			}
		}
	}
	var strRegex = new RegExp(filterCondition, "igm");
	return (val + "").replace(strRegex, "");
}

function _date(d, pattern) {
	d = new Date(d);
	pattern = pattern || 'yyyy-MM-dd';
	var y = d.getFullYear().toString(),
		o = {
			M: d.getMonth() + 1, //month
			d: d.getDate(), //day
			h: d.getHours(), //hour
			m: d.getMinutes(), //minute
			s: d.getSeconds() //second
		};
	pattern = pattern.replace(/(y+)/ig, function(a, b) {
		return y.substr(4 - Math.min(4, b.length));
	});
	for (var i in o) {
		pattern = pattern.replace(new RegExp('(' + i + '+)', 'g'), function(a, b) {
			return (o[i] < 10 && b.length > 1) ? '0' + o[i] : o[i];
		});
	}
	return pattern;
}

function _currency(val, symbol) {
	var places, thousand, decimal;
	places = 2;
	symbol = symbol !== undefined ? symbol : "$";
	thousand = ",";
	decimal = ".";
	var number = val,
		negative = number < 0 ? "-" : "",
		i = parseInt(number = Math.abs(+number || 0).toFixed(places), 10) + "",
		j = (j = i.length) > 3 ? j % 3 : 0;
	return symbol + negative + (j ? i.substr(0, j) + thousand : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousand) + (places ? decimal + Math.abs(number - i).toFixed(places).slice(2) : "");
}

var digitUppercase = function(n, bool) {
	var fraction = ['角', '分'],
		digit = [
			'零', '壹', '贰', '叁', '肆',
			'伍', '陆', '柒', '捌', '玖'
		],
		unit = [
			['元', '万', '亿'],
			['', '拾', '佰', '仟']
		],
		head = n < 0 ? '欠' : '';
	n = Math.abs(n);
	var s = '';
	for (var i = 0; i < fraction.length; i++) {
		s += (digit[Math.floor(n * 10 * Math.pow(10, i)) % 10] + (bool ? fraction[i] : '')).replace(/零./, bool ? '' : '零点');
	}
	s = s || '整';
	n = Math.floor(n);
	for (var i = 0; i < unit[0].length && n > 0; i++) {
		var p = '';
		for (var j = 0; j < unit[1].length && n > 0; j++) {
			p = digit[n % 10] + unit[1][j] + p;
			n = Math.floor(n / 10);
		}
		if (bool) {
			p = p.replace(/(零.)*零$/, '');
		} else {
			p = p.replace(/零./, '零点');
		}
		var dw = unit[0][i];
		if (dw == "元" && !bool) {
			dw = "点";
		}
		s = p.replace(/^$/, '零') + dw + s;
	}
	return head + s.replace(/(零.)*零元/, bool ? '元' : '')
		.replace(/(零.)+/g, bool ? '零' : '零点').replace(/零点$/, "整").replace(/点整$/, "")
		.replace(/^整$/, bool ? '零元整' : '零整');
};

var getLen = function(str, type) {
	var str = (str + "").replace(/\r|\n/ig, ""),
		temp1 = str.replace(/([^\x00-\xff]|[A-Z])/g, "**"),
		temp2 = temp1.substring(0),
		x_length = !type ? (temp2.split("\*").length - 1) / 2 + (temp1.replace(/\*/ig, "").length) : temp2.length;
	return x_length;
};

var textFix = function(name, num) {
	var max = num ? num : 16;
	return getLen(name, true) >= max ? _getText(name, max) : name;
};
var _getText = function(text, max) {
	var strs = [],
		n = 0,
		len = text.length,
		vtext = "";
	for (var i = 0; i < len; i++) {
		vtext = text.substr(i, 1).replace("“", " ").replace("”", " ");
		if (/([^\x00-\xff]|[A-Z])/.test(vtext)) {
			n += 2;
		} else {
			n += 1;
		}
		if (n <= max) {
			strs.push(vtext);
		}
	}
	return strs.join('');
};
String.prototype.textFix = function(num) {
	return textFix(this, num);
};
String.prototype.getLength = function(bool) {
	return getLen(this, bool);
};

var filter = {
	base64: function(val, filterCondition) {
		return "data:text/html;base64," + require("./pjs-html2base64").to(val);
	},
	filter: function(val, filterCondition) {
		return _tmplFilterVal(val.replace(/(^\")|(\"$)/igm, ""), filterCondition);
	},
	json: function(val, filterCondition) {
		return _stringify(val);
	},
	limitToCharacter: function(val, filterCondition) {
		if (is("string", val)) {
			return textFix(val, parseInt(filterCondition));
		}
		return val;
	},
	limitTo: function(val, filterCondition) {
		if (is("array", val)) {
			var a = [];
			val.forEach(function(n) {
				a.push(n);
			});
			return _stringify(a.splice(0, parseInt(filterCondition)));
		} else if (is("string", val)) {
			return val.substr(0, parseInt(filterCondition)); //textFix(val, parseInt(filterCondition));
		} else if (is("number", val) && /\./.test(val + "")) {
			return val.toFixed(filterCondition);
		} else if (is("number", val)) {
			var len = (val + "").length;
			return parseInt((val + "").substr(len - parseInt(filterCondition), filterCondition));
		}
		return val;
	},
	indexOf: function(val, filterCondition) {
		var index = -1,
			i;
		if (is("array", val)) {
			for (i = 0; i < val.length; i++) {
				if (val[i] == filterCondition) {
					index = i;
					break;
				}
			}
		}
		if (is("string", val)) {
			index = val.indexOf(filterCondition);
		}
		return index;
	},
	lowercase: function(val, filterCondition) {
		return val.toLowerCase();
	},
	uppercase: function(val, filterCondition) {
		return val.toUpperCase();
	},
	toCNRMB: function(val, filterCondition) {
		return digitUppercase(parseFloat(val), true);
	},
	toCNumber: function(val, filterCondition) {
		return digitUppercase(parseFloat(val), false);
	},
	orderBy: function(val, filterCondition) {
		if (is("array", val) && /reverse|sort/.test(filterCondition.toLowerCase())) {
			return val[filterCondition.toLowerCase()]();
		}
		return val;
	},
	date: function(val, filterCondition) {
		return _date(val, filterCondition);
	},
	currency: function(val, filterCondition) {
		return _currency(val);
	},
	empty: function(val, filterCondition) {
		return (typeof val == "string" && trim(val) == "" || val == null || typeof val == "undefined" || is("object", val) && isEmptyObject(val) || is("array", val) && val.length == 0) && filterCondition;
	},
	passcard: function(val, filterCondition) {
		var regex = /(\d{4})(\d{4})(\d{4})(\d{4})(\d{0,})/igm.exec(val);
		return regex && regex.splice(1, regex.length - 1).join(' ') || val;
	},
	encodeURI: function(val, filterCondition) {
		return encodeURIComponent(val);
	},
	decodeURI: function(val, filterCondition) {
		return decodeURIComponent(val);
	},
	toString: function(val, filterCondition) {
		return _stringify(val);
	},
	capitalize: function(val, filterCondition) {
		switch (filterCondition) {
			case 0:
				return _capitalize(val);
				break;
			default:
				var start = filterCondition - 1,
					end = filterCondition + 1,
					list = [];
				val.split('').forEach(function(str, i) {
					if (i == filterCondition) {
						list.push(str.toUpperCase())
					} else {
						list.push(str);
					}
				});
				return list.length > 0 ? list.join('') : val;
				break;
		}
	}
};

var startPrefix = "{{",
	endPrefix = "}}";

function tmpl(html, data) {
	for (name in data) {
		var reg = new RegExp(startPrefix + "\\s*((\\s+" + name + "\\s+)(\\s*([\\+\\-\\*\\/]|)\\s*(\\S+)|)|((\\S+)\\s*([\\+\\-\\*\\/]|)\\s*|)(\\s+" + name + "\\s+))\\s*(\\\|\\s*(\\S+)(\\s*\\\:\\s*[\\\"\\\']*([\\S\\d\$\/]+)[\\\"\\\']*|)|)\\s*" + endPrefix, "gim");
		//new RegExp("\\\{\\\{\\s*((" + name + ")(\\s*([\\+\\-\\*\\/]|)\\s*(\\S+)|))\\s*(\\\|\\s*(\\S+)(\\s*\\\:\\s*[\"\']*([a-zA-Z0-9\$\/]+)[\"\']*|)|)\\s*\\\}\\\}", "gim");
		//console.log(reg)
		var command = reg.exec(html);
		var dataval = data[name];
		if (command && command[10]) {
			//console.log("------------------------------------------")
			//console.log(command[0])
			if (command[7] && command[3] && command[3] != "") {
				var fun = "return " + (data[(command[7] + "").replace(/\s/g, "")] || command[7]) + command[8] + (data[(command[9] + "").replace(/\s/g, "")] || command[9]);
				dataval = (new Function(fun))();
			} else if (command[3] && command[3] != "") {
				var fun = "return " + (data[(command[2] + "").replace(/\s/g, "")] || command[2]) + command[4] + (data[(command[5] + "").replace(/\s/g, "")] || command[5]);
				dataval = (new Function(fun))();
			}
			var val = filter[command[11]](dataval, command[13] && command[13].replace(/[\"|\']/gim, "") || "");
			html = html.replace(command[0], val);
			if (reg.test(html)) {
				html = tmpl(html, (new Function("return {" + name + ":" + _stringify(data[name]) + "}")()));
			}
			//console.log("------------------------------------------")
		} else {
			var xreg = new RegExp(startPrefix + "\\s*((" + name + ")|(" + name + ")(\\.(\\S+))+?|)\\s*" + endPrefix, "gim");
			//console.log(xreg)
			command = xreg.exec(html);
			if (command && !command[2]) {
				var val = new Function("return ((" + _stringify(data[name]) + ")" + command[4] + ")")()
				html = html.replace(xreg, val);
			} else {
				html = html.replace(reg, dataval);
			}
		}
	}
	return html;
}


exports.tmpl = function(html, data) {
	var ifStr = startPrefix + "\\s*if\\s*",
		elseStr = startPrefix + "\\s*else\\s*" + endPrefix,
		endStr = startPrefix + "\\s*end\\s*if\\s*" + endPrefix,
		expStr = "[\\>\\<\\!\\=]+",
		expressStr = "\\s*" + expStr + "\\s*",
		reg = new RegExp(ifStr + "([\\\"\\\']*[\\S\\d]+[\\\"\\\']*" + expressStr + "[\\\"\\\']*[\\S\\d]+[\\\"\\\']*)\\s*" + endPrefix + "([\\r\\n]*([^]*)[\\r\\n]*" + elseStr + "[\\r\\n]*([^]*)|[\\r\\n]*([^]*)[\\r\\n]*)[\\r\\n]*" + endStr, "gim"),
		newfunReg = new RegExp("[\\\"\\\']*([^\\\"\\\'\\s]*)[\\\"\\\']*\\s*(" + expStr + ")\\s*[\\\"\\\']*([^\\\"\\\'\\s]*)[\\\"\\\']*");
	//console.log(reg)

	function build(command) {
		if (command) {
			var newfun = newfunReg.exec(command[1]),
				start, end;
			//console.log(newfun)
			if (newfun) {
				start = data[newfun[1]];
				end = data[newfun[3]];
				start = typeof start == "undefined" ? newfun[1] : (typeof start == "number" ? start + "" : start);
				end = typeof end == "undefined" ? newfun[3] : (typeof end == "number" ? end + "" : end);
				//console.log("---------end---------")
				//console.log(end)
				var name = "return " + _stringify(start).replace(/\"/gim, "\"").replace(/\'/gim, "\'") + newfun[2] + _stringify(end).replace(/\"/gim, "\"").replace(/\'/gim, "\'");
				//console.log(name)
				var bool = new Function(name)();
				//console.log("-----------bool----------")
				//console.log(bool)
				var elseReg = new RegExp(elseStr);
				if (!elseReg.test(command[2])) {
					html = html.replace(command[0], bool ? tmpl(command[2], data) : "");
				} else {
					var elseStrA = command[2].split(elseReg);
					html = html.replace(command[0], tmpl(bool ? elseStrA[0] : elseStrA[1], data));
				}
			}
			html = hasIFToBuild(html);
		}
		return html;
	}

	function hasIFToBuild(html) {
		var commandReg = new RegExp(ifStr + "[\\\"\\\']*[\\S\\d]+[\\\"\\\']*" + expressStr + "[\\\"\\\']*[\\S\\d]+[\\\"\\\']*\\s*" + endPrefix),
			command = commandReg.test(html);
		if (command) {
			//console.log("------------is---------------")
			//console.log(command)
			var ifReg = new RegExp(ifStr),
				splitstart = html.split(ifReg);
			if (splitstart.length > 1) {
				var endReg = new RegExp(endStr);
				splitstart.forEach && splitstart.forEach(function(obj) {
					if (endReg.test(obj)) {
						var splitend = obj.split(endReg);
						if (splitend.length > 1) {
							var boolReg = new RegExp("[\\\"\\\']*[^\\\"\\\'\\s]*[\\\"\\\']*" + expressStr + "[\\\"\\\']*[^\\\"\\\'\\s]*[\\\"\\\']*\\s*" + endPrefix);
							splitend.forEach && splitend.forEach(function(obja) {
								if (boolReg.test(obja)) {
									//console.log("---------splitend------------")
									//console.log("{{ if "+splitend[x]+"{{ end if }}");
									var splitStr = startPrefix + " if " + obja + startPrefix + " end if " + endPrefix;
									command = reg.exec(splitStr);
									//console.log(command)
									html = build(command);
								}
							});
						}
					}
				});
			}
			//html = build(command);
		}
		return html;
	}
	html = hasIFToBuild(html);
	return tmpl(html, data);

};
exports.stringify = function(obj) {
	return _stringify(obj);
};
exports.filter = filter;

exports.getFileDependencies = function(file, options, callback, dependencieFilter) {
	var mod = this,
		dependencies = [];
	if (mod.exists(mod.resolve(file))) {
		var contents = mod.read(mod.resolve(file));
		var is = /\{\{\s*(require|include)\([\"\']+(.+)[\"\']+\)\s*\}\}/.exec(contents);
		if (!is) {
			dependencies.push(file);
			var reg = /\/(.+)\/([a-zA-Z\_\-0-9]+)[\.\S]+\.js/.exec(file);
			if (reg) {
				var name = reg[2];
				callback && callback(dependencies, name);
			}
			return;
		}
		function fixDep(contents) {
			var depReg = /\{\{\s*(require|include)\([\"\']+(.+)[\"\']+\)\s*\}\}/.exec(contents);
			if (depReg) {
				if (depReg[1] == "require") {
					dependencies.push(depReg[2]);
					contents = contents.replace(new RegExp("\\r*\\n*\\{\\{\\s*require\\([\\\"\\\']+" + depReg[2] + "[\\\"\\\']+\\)\\s*\\}\}\\r*\\n*"), "");
				} else if (depReg[1] == "include") {
					if (depReg[2] in options.alias) {
						var path = mod.resolve(options.baseURI + options.name + "/js/" + options.alias[depReg[2]] + ".js");
						var includeContext = mod.read(path);
						contents = contents.replace(new RegExp("\\r*\\n*\\{\\{\\s*include\\([\\\"\\\']+" + depReg[2] + "[\\\"\\\']+\\)\\s*\\}\\}\\r*\\n*"), includeContext);
					}
				}
				contents = fixDep(contents);
			}
			return contents;
		}
		contents = fixDep(contents);
		var paths = file;
		//if (dependencies.length > 0) {
			paths = file.replace(options.baseURI, "temp/").replace(/\.js$/, ".temp.js");
			if (mod.exists(mod.resolve(paths))) {
				mod.delete(mod.resolve(paths));
			}
			mod.write(mod.resolve(paths), contents);
		//}
		var reg = /\/(.+)\/([a-zA-Z\_\-0-9]+)[\.\S]+\.js/.exec(file);
		if (reg) {
			var name = reg[2];
			if (dependencieFilter) {
				dependencieFilter(dependencies, name, function(dependencies, name) {
					dependencies.push(paths);
					callback && callback(dependencies, name);
				});
			} else {
				dependencies.push(paths);
				callback && callback(dependencies, name);
			}
		}
	} else {
		callback && callback(dependencies);
	}
};