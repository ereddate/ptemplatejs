/*!
 * ptemplatejs v1.0.0
 * @author yandong
 *

	$.Table("#app", {
		thead:"test",
		tbody: $.DOM.tr({
			"p-express:for": "i in body"
		}, $.DOM.td({
			text: "{{name}}",
			cls: 'bodyitem textleft'
		})),
		tfoot: $.DOM.tr({}, $.DOM.td({
			colspan: 3
		}, $.DOM.span({
			text: 'count: {{body.length}}'
		})))
	}).render(() => { return {body:[{...}]}; });


 * https://github.com/ereddate/ptemplatejs
 */
'use strict';
typeof window.pTemplate != "undefined" && ((win, $) => {

	class Table {
		constructor(selector, props) {
			this.base = $.query(selector);
			props && $.extend(this, props);
			this.template = $.DOM.div({}, $.DOM.table({
					width: "100%"
				},
				this.caption && (typeof this.caption === "string" ? $.__mod__.templates[this.caption] && $.DOM.caption({
					html: $.__mod__.templates[this.caption].content
				}) : $.__mod__.isPlainObject(this.caption) ? $.DOM.custom('caption', {}, this.caption) : $.__mod__.isArray(this.caption) ? (this.caption.splice(0, 0, {}), $.DOM.caption.apply($.DOM.caption, this.caption)) : $.DOM.caption({}, this.caption)),
				this.thead && (typeof this.thead === "string" ? $.__mod__.templates[this.thead] && $.DOM.thead({
					html: $.__mod__.templates[this.thead].content
				}) : $.__mod__.isPlainObject(this.thead) ? $.DOM.custom('thead', {}, this.thead) : $.__mod__.isArray(this.thead) ? (this.thead.splice(0, 0, {}), $.DOM.thead.apply($.DOM.thead, this.thead)) : $.DOM.thead({}, this.thead)),
				this.tbody && (typeof this.tbody === "string" ? $.__mod__.templates[this.tbody] && $.DOM.tbody({
					html: $.__mod__.templates[this.tbody].content
				}) : $.__mod__.isPlainObject(this.tbody) ? $.DOM.custom('tbody', {}, this.tbody) : $.__mod__.isArray(this.tbody) ? (this.tbody.splice(0, 0, {}), $.DOM.tbody.apply($.DOM.tbody, this.tbody)) : $.DOM.tbody({}, this.tbody)),
				this.tfoot && (typeof this.tfoot === "string" ? $.__mod__.templates[this.tfoot] && $.DOM.tfoot({
					html: $.__mod__.templates[this.tfoot].content
				}) : $.__mod__.isPlainObject(this.tfoot) ? $.DOM.custom('tfoot', {}, this.tfoot) : $.__mod__.isArray(this.tfoot) ? (this.tfoot.splice(0, 0, {}), $.DOM.tfoot.apply($.DOM.tfoot, this.tfoot)) : $.DOM.tfoot({}, this.tfoot))))
			//console.log(this.template)
			return this;
		}
		render(callback) {
			var data = callback && callback() || {},
				that = this;
			$.render(that.template, data, this.base, (item) => {
				that.table = item._children()[0];
			});
			return this;
		}
		sort(type, item, flagFn, sorted) {
			var that = this,
				trs = that.table._findNode("tbody>tr"),
				index = item._parent()._index(),
				map = [];
			trs._each((i, tr) => {
				var tds = $.query(tr)[0]._findNode("td");
				flagFn && map.push(flagFn(tds[index]._html()));
			});
			if (item._data("type") === "down") {
				map = type === "number" ? map.sort(function(a, b) {
					return a - b;
				}) : map.sort();
				item._data("type", "up");
			} else {
				map = type === "number" ? map.sort(function(a, b) {
					return b - a;
				}) : map.sort().reverse();
				item._data("type", "down");
			}
			var ntable = $.DOM.template({}, $.DOM.tbody({}));
			map._each((i, item) => {
				trs._each((i, tr) => {
					var tds = $.query(tr)[0]._findNode("td");
					if (flagFn && item === flagFn(tds[index]._html())) {
						ntable._findNode("tbody")[0]._append(tr);
					}
				});
			});
			var oldtbody = that.table._findNode("tbody")[0];
			that.table.replaceChild(ntable._findNode("tbody")[0], oldtbody);
			sorted && sorted(item._data('type'));
			return this;
		}
		checkBoxSelectAll(item) {
			var that = this,
				trs = that.table._findNode('tbody>tr'),
				index = item._parent()._index();
			if (item._attr("checked")) {
				item._removeAttr("checked")
			} else {
				item._attr("checked", "checked")
			}
			trs._each((i, tr) => {
				item._attr("checked") ? tr._findNode("input[type=checkbox]")[0]._attr("checked", "checked") : tr._findNode("input[type=checkbox]")[0]._removeAttr("checked");
			})
			return this;
		}
		checkBoxNoSelectAll(item) {
			var that = this,
				thall = that.table._findNode("th>input"),
				index = item._parent()._index();

			if (item._attr("checked")) {
				item._removeAttr("checked");
				thall[0]._removeAttr("checked");
			} else {
				item._attr("checked", "checked");
			}
			return this;
		}
	}

	$.Table = (selector, props) => {
		return new Table(selector, props);
	}

})(window, pTemplate);