/*!
 * ptemplatejs v1.0.0
 * @author yandong
 *
 * https://github.com/ereddate/ptemplatejs
 */
'use strict';
typeof window.pTemplate != "undefined" && (function(win, $) {
	var mod = $.__mod__;
	var jsonSql = {
		query: function(sql, json) {
			var jsonSql_Fields = sql.match(/^(select)\s+([a-z0-9_\,\.\s\*]+)\s+from\s+([a-z0-9_\.,]+)(?: where\s+\((.+)\))?\s*(?:order\sby\s+([a-z0-9_\,]+))?\s*(asc|desc|ascnum|descnum)?\s*(?:limit\s+([0-9_\,]+))?/i);
			var ops = {
				fields: jsonSql_Fields[2].replace(' ', '').split(','),
				from: jsonSql_Fields[3].replace(' ', ''),
				where: (jsonSql_Fields[4] == undefined) ? "" : jsonSql_Fields[4],
				orderby: (jsonSql_Fields[5] == undefined) ? [] : jsonSql_Fields[5].replace(' ', '').split(','),
				order: (jsonSql_Fields[6] == undefined) ? "asc" : jsonSql_Fields[6],
				limit: (jsonSql_Fields[7] == undefined) ? [] : jsonSql_Fields[7].replace(' ', '').split(',')
			};
			return this.parse(json, ops);
		},
		parse: function(json, ops) {
			var o = mod.extend({
				fields: ["*"],
				from: "json",
				where: "",
				orderby: [],
				order: "asc",
				limit: []
			}, ops);
			var result = [];
			result = this.jsonSql_Filter(json, o);
			result = this.jsonSql_OrderBy(result, o.orderby, o.order);
			result = this.jsonSql_Limit(result, o.limit);
			return result;
		},
		jsonSql_Filter: function(json, jsonsql_o) {
			var that = this;
			var jsonsql_result = [];
			var jsonsql_rc = 0;
			jsonsql_o.from.split(',')._each(function(n, from) {
				var jsonsql_scope = new Function(from, "return " + from)(json[from]);
				if (jsonsql_o.where != "") {
					jsonsql_o.where = jsonsql_o.where.replace(/\s+\=\s+/gim, "==").replace(/\s+and\s+/gim, " && ").replace(/\s+or\s+/gim, " || ");
					var jowArr = jsonsql_o.where.split(/\s+\|\|\s+/.test(jsonsql_o.where) && ' || ' || /\s+\&\&\s+/.test(jsonsql_o.where) && ' && ');
					jowArr._each(function(i, jow) {
						var jowSArr = jow.split(/\s+\|\|\s+/.test(jow) && ' || ' || /\s+\&\&\s+/.test(jow) && ' && ')
						if (jowSArr.length === 1) {
							if (/in/.test(jowSArr[0])) {
								var owhere = /([^|&\s]+)\s+in\s+\((.+)\)/.exec(jowSArr[0]),
									sowhere = [];
								if (/^\(/.test(owhere[1])) {
									sowhere.push('(');
								}
								owhere[2].split(',')._each(function(i, ow) {
									sowhere.push("\/" + ow.replace(/'/gim, "").replace(/\)$/, "") + "\/.test(" + owhere[1].replace(/^\(/gim, "").replace(/\)$/gim, "") + ")");
									if (/\)$/.test(ow)) {
										sowhere.push(')');
									}
								});
								if (/\)$/.test(owhere[1])) {
									sowhere.push(')');
								}
								jowArr[i] = sowhere.join(' || ');
							}
						} else {
							jowSArr._each(function(x, jowItem) {
								if (/in/.test(jowItem)) {
									var owhere = /([^|&\s]+)\s+in\s+\((.+)\)/.exec(jowItem),
										sowhere = [];
									if (/^\(/.test(owhere[1])) {
										sowhere.push('(');
									}
									owhere[2].split(',')._each(function(i, ow) {
										sowhere.push("\/" + ow.replace(/'/gim, "").replace(/\)$/, "") + "\/.test(" + owhere[1].replace(/^\(/gim, "").replace(/\)$/, "") + ")");
										if (/\)$/.test(ow)) {
											sowhere.push(')');
										}
									});
									if (/\)$/.test(owhere[1])) {
										sowhere.push(')');
									}
									jowSArr[x] = sowhere.join(/\|\|/.test(jowItem) && ' || ' || /\&\&/.test(jowItem) && ' && ' || '');
								}
							});
							jowArr[i] = jowSArr.join(/\|\|/.test(jow) && ' || ' || /\&\&/.test(jow) && ' && ' || /\s+and\s+/.test(jow) && ' && ' || /\s+or\s+/.test(jow) && ' || ' || "");
						}
					});
					jsonsql_o.where = jowArr.join(/\|\|/.test(jsonsql_o.where) && ' || ' || /\&\&/.test(jsonsql_o.where) && ' && ');
				} else {
					jsonsql_o.where = 'true';
				}
				//console.log(jsonsql_o.where)
				var fn = new Function("json", "var a =" + jsonsql_o.where + ";return a;");
				if (fn(jsonsql_scope)) {
					jsonsql_result.push(that.jsonSql_Fields(jsonsql_scope, jsonsql_o.fields));
				}
			});
			return jsonsql_result;
		},
		jsonSql_Fields: function(scope, fields) {
			if (fields.length == 0)
				fields = ["*"];
			if (fields[0] == "*")
				return scope;
			var returnobj = {};
			for (var i in fields) {
				scope[fields[i]] && (returnobj[fields[i]] = scope[fields[i]]);
			}
			return returnobj;
		},
		jsonSql_OrderBy: function(result, orderby, order) {
			if (orderby.length == 0)
				return result;
			result.sort(function(a, b) {
				switch (order.toLowerCase()) {
					case "desc":
						return (eval('a.' + orderby[0] + ' < b.' + orderby[0])) ? 1 : -1;
					case "asc":
						return (eval('a.' + orderby[0] + ' > b.' + orderby[0])) ? 1 : -1;
					case "descnum":
						return (eval('a.' + orderby[0] + ' - b.' + orderby[0]));
					case "ascnum":
						return (eval('b.' + orderby[0] + ' - a.' + orderby[0]));
				}
			});
			return result;
		},
		jsonSql_Limit: function(result, limit) {
			switch (limit.length) {
				case 0:
					return result;
				case 1:
					return result.splice(0, limit[0]);
				case 2:
					return result.splice(limit[0] - 1, limit[1]);
			}
		}
	};

	class Store {
		constructor(name, data) {
			mod.extend(this, {
				name: name,
				data: data
			});
			this.log = [{
				data: mod.extend({}, data),
				msg: "init"
			}];
			mod._stores[this.name] = this;
			return this;
		}
		commit(data, msg) {
			mod._stores[this.name] && data && mod.extend(mod._stores[this.name].data, data);
			if (msg) {
				this.log.push({
					data: data,
					msg: msg
				});
			}
			return this;
		}
		get(name) {
			var that = this;
			if (name) {
				name = name.split(' ');
				if (name.length > 1) {
					var a = {};
					mod._stores[that.name] && mod.each(name, function(i, n) {
						a[n] = mod._stores[that.name].data[n];
					});
					return a;
				} else {
					return mod._stores[that.name].data[name[0]];
				}
			} else {
				return mod._stores[that.name].data;
			}
		}
		find(selector) {
			var that = this;
			return jsonSql.query(selector, mod._stores[that.name].data);
		}
		clear() {
			mod._stores[this.name].data = {};
			return this;
		}
		remove(name) {
			if (mod._stores[this.name] && name) {
				name = name.split(' ');
				mod.each(name, function(i, n) {
					delete mod._stores[this.name].data[n];
				});
			} else {
				delete mod._stores[this.name];
			}
			return this;
		}
		clone(name) {
			return new Store(name, mod._stores[this.name].data);
		}
		diff(data) {
			return mod.diff(this.data, data);
		}
		showlog(n) {
			return n && this.log[n] || this.log;
		}
		revert(n) {
			if (this.log[n]) {
				var diff = mod.diff(this.log[n].data, this.data),
					that = this;
				mod.each(diff, function(name, v) {
					if (that.log[n].data[name] && that.data[name] !== that.log[n].data[name]) {
						that.data[name] = that.log[n].data[name];
					} else {
						delete that.data[name];
					}
				});
				this.log.push({
					data: this.log[n].data,
					msg: "revert " + n
				});
			}
			return this;
		}
	}

	$.extend($, {
		store: function(name, data) {
			var args = arguments,
				len = args.length,
				that = this;
			if (len === 1) {
				return mod._stores[name];
			} else {
				return new Store(name, data);
			}
			return data;
		}
	});
})(window, pTemplate);