/*!
 * ptemplatejs v1.0.0
 * @author yandong
 *
 * https://github.com/ereddate/ptemplatejs
 */
'use strict';
typeof window.pTemplate != "undefined" && (function(win, $) {
	$.extend($.__mod__.pSubClass, {
		_childRenHeight: function(bool) {
			var height = 0;
			this._children()._each((i, cr) => {
				height += cr._height(bool);
			});
			return height;
		}
	});
	var getScreenColumn = (maxColumn) => {
		var width = $.query(document)[0]._width();
		return width < 375 ? 1 : width >= 375 && width < 1024 ? width >=768 ? 3 : 2 : maxColumn;
	};
	var waterfallTimeout = null;
	$.waterfall = function(selector, options) {
		var node = typeof selector === "string" ? $.query(selector)[0] : selector,
			maxColumn = options.maxColumn || 4,
			column = getScreenColumn(maxColumn),
			sort = options.sort || "sort",
			type = options.type || "normal",
			reload = function() {
				waterfallTimeout && clearTimeout(waterfallTimeout);
				waterfallTimeout = setTimeout(function() {
					node._empty();
					var columnItems = [],
						columns = [],
						columnsHeight = [];
					for (var i = 0; i < column; i++) {
						var columnItem = $.createDom("div", $.extend(column < 2 ? {
							cls: "column",
							style: "width:100%"
						} : column < maxColumn ? {
							cls: "column",
							style: "width:50%"
						} : {
							cls: "column",
							style: "width:"+Math.round(100/maxColumn)+"%"
						}, {
							index: i
						}));
						//columnItems.push(columnItem._height()||0);
						columns.push(columnItem);
						columnsHeight.push(columnItem._height(true) || 0);
						node && node._append(columnItem);
					}
					var data = [];
					if (sort === "reverse") {
						for (var n = options.data.length; n > 0; n--) {
							data.push(options.data[n]);
						}
					} else {
						for (var n = 0; n < options.data.length; n++) {
							data.push(options.data[n]);
						}
					}
					var cbs = $.Callbacks(),
						n = -1;
					data._each(function(i, dataItem) {
						cbs.add(function(next) {
							n += 1;
							if (data[n]) {
								var item = data[n];
								$.extend(item, {
									id: n
								});
								var a = $.DOM.div({
									style: "opacity:0",
									html: $.tmpl(typeof options.template === "string" ? options.template : options.template._html(), item)
								});
								var b = Math.min.apply(Math, columnsHeight) || 0;
								var index = columnsHeight.indexOf(b);
								index = index < 0 ? 0 : index;
								var item = node._children()._eq(index);
								item && item._append(a);
								a._findNode("img")[0]._on("load error", function(e) {
									a._css({
										opacity: 1
									});
									if (item) {
										columnsHeight.splice(index, 1, type === "normal" ? item._childRenHeight(true) : item._height(true));
									}
									next();
								});
							} else {
								next();
							}
						});
					});
					cbs.done();
				}, 500);
			};
		if (node) {
			return {
				render: function() {
					$.query(window)._on("resize", function() {
						location.reload()
					});
					reload();
				}
			}
		}
	}
})(window, pTemplate);