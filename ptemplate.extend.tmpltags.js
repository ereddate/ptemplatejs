/*!
 * ptemplatejs v1.0.0
 * @author yandong
 *
 * https://github.com/ereddate/ptemplatejs
 */
'use strict';
typeof window.pTemplate != "undefined" && (function(win, $) {
	function toJson(a, b) {
		if (a.length) {
			for (var i = 0; i < a.length; i++) b[a[i].name] = a[i].value;
		}
		return b;
	}
	var validData = {
		empty: function(elem, t, value) {
			switch (t) {
				case 1:
					if (elem.type == "radio") {
						var v = false;
						$.query("input[name=" + elem.name + "]").forEach(function(e) {
							!!e.checked && (v = e.value)
						});
						if (v) {
							v = $.__mod__.trim(v);
							return /\s+/.test(v) || v == "";
						}
						return v;
					} else {
						var val = $.__mod__.trim(elem._val());
						return /\s+/.test(val) || val == "";
					}
					break;
				case 2:
				case 3:
					var val = $.__mod__.trim(elem._val());
					return /\s+/.test(val) || val == "";
					break;
			}
		},
		diff: function(elem, t, value) {
			switch (t) {
				case 1:
				case 3:
					var val = $.__mod__.trim(elem._val()),
						next = elem._parents(".validform")._query("name=" + value),
						nextVal = "";
					if (next[0]){
						nextVal = $.__mod__.trim(next[0]._val());
						return val != nextVal ? true : false;
					}
					return true;
					break;
			}
		},
		max: function(elem, t, value) {
			switch (t) {
				case 1:
				case 3:
					var val = $.__mod__.trim(elem._val());
					return !(new RegExp("^." + (value && value.replace(/-/gim, ",") || "") + "$")).test(val);
					break;
			}
		},
		number: function(elem, t, value) {
			switch (t) {
				case 1:
				case 2:
				case 3:
					var val = $.__mod__.trim(elem._val());
					return !/^\d+$/.test(val);
					break;
			}
		},
		ns: function(elem, t, value) {
			switch (t) {
				case 1:
				case 3:
					var val = $.__mod__.trim(elem._val());
					return !/^[a-zA-Z0-9]+$/.test(val);
					break;
			}
		},
		cn: function(elem, t, value) {
			switch (t) {
				case 1:
				case 2:
				case 3:
					var val = $.__mod__.trim(elem._val());
					return !/^[\u4E00-\u9FA5\uf900-\ufa2d]+$/.test(val);
					break;
			}
		},
		selected: function(elem, t, value) {
			switch (t) {
				case 1:
					if (elem.type == "radio") {
						var v = false;
						$.query("input[name=" + elem.name + "]").forEach(function(e) {
							!!e.checked && (v = true);
						});
						return !v ? true : false;
					} else {
						return !elem.checked;
					}
					break;
				case 2:
					var selected = false;
					[].slice.call(elem.children).forEach(function(e) {
						!e.selected && (selected = true);
					});
					return selected;
					break;
			}
		},
		mobile: function(elem, t, value) {
			switch (t) {
				case 1:
					var val = $.__mod__.trim(elem._val());
					return !/^13[0-9]{9}$|14[0-9]{9}|15[0-9]{9}$|18[0-9]{9}$/.test(val);
					break;
			}
		},
		email: function(elem, t, value) {
			switch (t) {
				case 1:
					var val = $.__mod__.trim(elem._val());
					return !/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(val);
					break;
			}
		},
		url: function(elem, t, value) {
			switch (t) {
				case 1:
				case 3:
					var val = $.__mod__.trim(elem._val());
					return !/^(\w+:\/\/)?\w+(\.\w+)+.*$/.test(val);
					break;
			}
		}
	};
	!$.__mod__.tmplTags && ($.__mod__.tmplTags = {});
	$.extend($.__mod__.tmplTags, {
		animate: function(obj, data) {
			var attrs = obj.attributes && obj.attributes.length > 0 && [].slice.call(obj.attributes) || false;
			if (attrs) {
				var p = {};
				attrs.forEach(function(a) {
					p[a.name] = a.value;
				});
				var elem = obj.children[0];
				elem._attr(p)._on("animate", function() {
					$.__mod__.animate && $.__mod__.animate(this, this._attr("end") || {}, this._attr("speed") || 500, this._attr("callback") && data.handle && data.handle[this._attr("callback")]);
				});
				return elem;
			}
		},
		videoplay: function(obj, data) {
			var result = $.video(obj);
			if (result.nodeType) {
				return result;
			}
		},
		validform: function(obj, data) {
			var valid = function(form) {
				var result = true,
					errElem, errType;
				$.each("input select textarea".split(' '), function(i, name) {
					var elems = form._query(name);
					if (elems && elems.length > 0 && result) {
						$.each(elems, function(x, e) {
							var v = e._attr("datatype");
							v = v.split(' ');
							if (result) {
								$.each(v, function(x, val) {
									val = val.split(':');
									var r = validData[val[0]](e, i + 1, val[1]);
									if (r == true) {
										result = false;
										errElem = e;
										errType = val[0];
										return false;
									}
								});
							} else {
								return false;
							}
						});
					} else {
						return false;
					}
				});
				return {
					r: result,
					e: errElem,
					v: errType
				};
			};
			var attrs = obj.attributes,
				a = toJson(attrs, {}),
				isForm = a.submithandle,
				b = $.createDom("form", {
					html: obj._html(),
					class: "validform"
				});
			b._query("button[datatype=submit]").length > 0 && b._query("button[datatype=submit]")[0]._on("click", function(e) {
				e.preventDefault();
				var result = valid(b);
				if (result.r) {
					b._on("submit", function(e, args) {
						!isForm ? this.submit() : data.handle && a.submithandle && data.handle[a.submithandle] && data.handle[a.submithandle].call(this, e, args);
					});
					b._trigger("submit");
				} else {
					data.handle && a.errorhandle && data.handle[a.errorhandle] && data.handle[a.errorhandle].call(this, e, result.e, result.v);
				}
			});
			return b;
		},
		"if-group": function(obj, data) {
			var p = [];
			[].slice.call(obj.children).forEach(function(n) {
				switch (n.tagName.toLowerCase()) {
					case "if":
					case "else-if":
						p.push(n.tagName.toLowerCase().replace(/-/gim, " ") + " (" + n._attr("express") + "){ result = '" + n._html().replace(/\s+/gim, " ").replace(/\r\n\t/gim, "").replace(/'/gim, "\\\'").replace(/"/gim, "\\\"") + "' ;}");
						break;
					case "else":
						p.push(n.tagName.toLowerCase() + " { result = '" + n._html().replace(/\s+/gim, " ").replace(/\r\n\t/gim, "").replace(/'/gim, "\\\'").replace(/"/gim, "\\\"") + "' ;}");
						break;
				}
			});
			if (p.length > 0) {
				p.splice(0, 0, "var result = \"\";");
				p.push("return result;");
			}
			try {
				return $.createDom("div", {
					html: new Function(p.join(''))()
				}).children[0];
			} catch (e) {
				console.log(e);
			}
		},
		if: function(obj, data) {
			var a = obj._attr("express");
			try {
				var html = new Function("return " + a + " ? '" + obj._html().replace(/\s+/gim, " ").replace(/\r\n\t/gim, "").replace(/'/gim, "\\\'").replace(/"/gim, "\\\"") + "' : '';")();
				if (html != "") {
					return $.createDom("div", {
						html: html
					}).children[0];
				} else {
					obj._remove();
				}
			} catch (e) {
				console.log(e);
			}
		}
	});
})(this, pTemplate);