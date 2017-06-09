'use strict';
typeof window.pTemplate != "undefined" && (function(win, $) {
	$.__mod__.tmplAttributes && $.extend($.__mod__.tmplAttributes, {
		router: function(obj, type, a, data) {
			if ($.__mod__.routes && $.__mod__.routes[a.value]) {
				var result = $.__mod__.routes[a.value];
				if (Object.is(typeof result, "function")) {
					result = result();
				}
				var params = $.__mod__.jsonToUrlString(result.params || {}, "&"),
					val = result.path + (params == "" ? "" : !/\?/.test(result.path) ? "?" : "&") + params;
				obj._attr(type, val);
				obj._removeAttr(a.name)
			}
		},
		custom: function(obj, type, a, data){
			obj._attr(type, a.value);
			obj._removeAttr(a.name);
		},
		handle: function(obj, type, a, data) {
			switch (type) {
				case "watch":
					data.handle && (obj._on("DOMSubtreeModified", function(e) {
						if (e.target.nodeType === 1) {
							e.target._trigger && e.target._trigger("watch");
						}
					})._on(type, data.handle[a.value]), obj._removeAttr(a.name));
					break;
				default:
					data.handle && (obj._on(type, data.handle[a.value]), obj._removeAttr(a.name));
					break;
			}
		}
	})
})(this, pTemplate)