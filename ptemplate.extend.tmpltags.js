/*!
 * ptemplatejs v1.0.0
 * @author yandong
 *
 * https://github.com/ereddate/ptemplatejs
 */
'use strict';
typeof window.pTemplate != "undefined" && (function(win, $) {
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
				}else{
					obj._remove();
				}
			} catch (e) {
				console.log(e);
			}
		}
	});
})(this, pTemplate);