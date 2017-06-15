'use strict';
typeof window.pTemplate != "undefined" && (function(win, $) {
	var stringify = $.__mod__.stringify = function(obj) {
			if (null == obj)
				return "null";
			if ("string" != typeof obj && obj.toJSON)
				return obj.toJSON();
			var type = typeof obj;
			switch (type) {
				case "string":
					return '"' + obj.replace(/[\"\r\n\t\\]+/gim, ((a) => {
						return "\\\\" + a
					})) + '"';
				case "number":
					var ret = obj.toString();
					return /N/.test(ret) ? "null" : ret;
				case "boolean":
					return obj.toString();
				case "date":
					return "new Date(" + obj.getTime() + ")";
				case "array":
					for (var ar = [], i = 0; i < obj.length; i++)
						ar[i] = stringify(obj[i]);
					return "[" + ar.join(",") + "]";
				case "object":
					if ($.__mod__.isPlainObject(obj)) {
						ar = [];
						for (var i in obj)
							ar.push('"' + i.replace(/[\"\r\n\t\\]+/gim, ((a) => {
								return "\\\\" + a
							})) + '":' + stringify(obj[i]));
						return "{" + ar.join(",") + "}"
					}
			}
			return "null"
		},
		_tmplFilterVal = function(val, filterCondition) {
			if (typeof filterCondition == "function") {
				return filterCondition(val);
			} else if (typeof filterCondition == "object") {
				if ($.__mod__.isPlainObject(filterCondition)) {
					for (var name in filterCondition) {
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
		},
		getLen = function(str, type) {
			var str = (str + "").replace(/\r|\n/ig, ""),
				temp1 = str.replace(/([^\x00-\xff]|[A-Z])/g, "**"),
				temp2 = temp1.substring(0),
				x_length = !type ? (temp2.split("\*").length - 1) / 2 + (temp1.replace(/\*/ig, "").length) : temp2.length;
			return x_length;
		},
		textFix = function(name, num) {
			var max = num ? num : 16;
			return getLen(name, true) >= max ? _getText(name, max) : name;
		},
		_getText = function(text, max) {
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
		},
		_capitalize = function(val) {
			return val[0].toUpperCase() + val.substr(1);
		},
		_date = function(d, pattern) {
			d = d ? new Date(d) : new Date();
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
		},
		_currency = function(val, symbol) {
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
		};
	($.__mod__.tmplThesaurus || !$.__mod__.tmplThesaurus && ($.__mod__.tmplThesaurus = {})) && $.extend($.__mod__.tmplThesaurus, {
		filter: function(val, filterCondition) {
			return _tmplFilterVal(val, filterCondition);
		},
		json: function(val, filterCondition) {
			return stringify(val);
		},
		limitToCharacter: function(val, filterCondition) {
			if ($.__mod__.is("string", val)) {
				return textFix(val, parseInt(filterCondition));
			}
			return val;
		},
		limitTo: function(val, filterCondition) {
			if ($.__mod__.is("array", val)) {
				var a = [];
				val.forEach(function(n) {
					a.push(n);
				});
				return stringify(a.splice(0, parseInt(filterCondition)));
			} else if ($.__mod__.is("string", val)) {
				return val.substr(0, parseInt(filterCondition)); //textFix(val, parseInt(filterCondition));
			} else if ($.__mod__.is("number", val) && /\./.test(val + "")) {
				return val.toFixed(filterCondition);
			} else if ($.__mod__.is("number", val)) {
				var len = (val + "").length;
				return parseInt((val + "").substr(len - parseInt(filterCondition), filterCondition));
			}
			return val;
		},
		indexOf: function(val, filterCondition) {
			var index = -1,
				i;
			if ($.__mod__.is("array", val)) {
				for (i = 0; i < val.length; i++) {
					if (val[i] == filterCondition) {
						index = i;
						break;
					}
				}
			}
			if ($.__mod__.is("string", val)) {
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
		toRem: function(val, filterCondition) {
			return (parseFloat(val) / parseFloat(filterCondition)).toFixed(4);
		},
		orderBy: function(val, filterCondition) {
			if ($.__mod__.is("array", val) && /reverse|sort/.test(filterCondition.toLowerCase())) {
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
			return (typeof val == "string" && $.__mod__.trim(val) == "" || val == null || typeof val == "undefined" || $.__mod__.is("object", val) && $.__mod__.isEmptyObject(val) || $.__mod__.is("array", val) && val.length == 0) && filterCondition || "";
		},
		passcard: function(val, filterCondition) {
			var num = filterCondition || 4,
				exp = new RegExp("(\\d{" + num + "})(\\d{" + num + "})(\\d{" + num + "})(\\d{" + num + "})(\\d{0,})"),
				regex = exp.exec(val);
			return regex && regex.splice(1, regex.length - 1).join(' ') || val;
		},
		encodeURI: function(val, filterCondition) {
			return encodeURIComponent(val);
		},
		decodeURI: function(val, filterCondition) {
			return decodeURIComponent(val);
		},
		toString: function(val, filterCondition) {
			return stringify(val);
		},
		cssPrefix: function(val, filterCondition) {
			val = val.replace(/["']*/gi, "");
			var toAda = [];
			var a = document.createElement("div").style;
			$.__mod__.each(["", "webkit", "o", "ms", "moz"], function(i, name) {
				var valname = val.replace(/\s*/gi, "").split(':')[0];
				valname = valname.split('-');
				if (name != "" && (name + (valname.length > 1 ? _capitalize(valname[0]) + _capitalize(valname[1]) : _capitalize(valname[0])) in a)) {
					toAda.push("-" + name + "-" + val);
				} else if (name == "") {
					toAda.push(val);
				}
			});
			return toAda.join(';');
		},
		rgbToHex: function(val, filterCondition) {
			var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/,
				that = val;
			if (/^(rgb|RGB)/.test(that)) {
				var aColor = that.replace(/(?:||rgb|RGB)*/g, "").replace(/\s*/gi, "").split(",");
				var strHex = "#";
				for (var i = 0; i < aColor.length; i++) {
					var hex = Number(aColor[i]).toString(16);
					if (hex === "0") {
						hex += hex;
					}
					strHex += hex;
				}
				if (strHex.length !== 7) {
					strHex = that;
				}
				return strHex;
			} else if (reg.test(that)) {
				var aNum = that.replace(/#/, "").split("");
				if (aNum.length === 6) {
					return that;
				} else if (aNum.length === 3) {
					var numHex = "#";
					for (var i = 0; i < aNum.length; i += 1) {
						numHex += (aNum[i] + aNum[i]);
					}
					return numHex;
				}
			} else {
				return that;
			}
		},
		hexToRgb: function(val, filterCondition) {
			var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/,
				sColor = val.toLowerCase();
			if (sColor && reg.test(sColor)) {
				if (sColor.length === 4) {
					var sColorNew = "#";
					for (var i = 1; i < 4; i += 1) {
						sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
					}
					sColor = sColorNew;
				}
				var sColorChange = [];
				for (var i = 1; i < 7; i += 2) {
					sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
				}
				return sColorChange.join(",");
			} else {
				return sColor;
			}
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
							list.push(str.toLowerCase());
						}
					});
					return list.length > 0 ? list.join('') : val;
					break;
			}
		}
	});

})(this, pTemplate);