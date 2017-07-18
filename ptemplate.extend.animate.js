/*!
 * ptemplatejs v1.0.0
 * @author yandong
 *
 * https://github.com/ereddate/ptemplatejs
 */
'use strict';
typeof window.pTemplate != "undefined" && (function(win, $) {
	function toJson(ops, a) {
		ops = ops.split(";");
		ops.forEach(function(o) {
			o = o.split(':');
			if ($.__mod__.isPlainObject(a)){
				a[o[0]] = o[1];
			}else{
				a.push(o);
			}
		});
		ops = a;
		return ops;
	}
	class animate {
		constructor() {
			this.endEventNames = 'webkitAnimationEnd oAnimationEnd MSAnimationEnd animationend';
		}
		play(elem, ops, speed, callback, ease) {
			var that = this;
			if (typeof ops == "string") {
				ops = toJson(ops, {});
			}
			this.options = {
				elem: elem,
				ops: ops,
				speed: speed,
				callback: callback,
				ease: ease || "ease"
			};
			var p = [],
				e = [];
			if (elem._attr("start")) {
				p = toJson(elem._attr("start"), []);
				for (var i in ops) {
					var val = win.getComputedStyle(elem, null).getPropertyValue(i);
					e.push(i + ":" + ops[i] + (!/px/.test(ops[i]) && /px/.test(val) ? "px" : ""));
				}
				elem._removeAttr("style");
			} else {
				for (var i in ops) {
					var val = win.getComputedStyle(elem, null).getPropertyValue(i);
					p.push(i + ":" + val);
					e.push(i + ":" + ops[i] + (!/px/.test(ops[i]) && /px/.test(val) ? "px" : ""));
				}
			}
			!elem._attr("start") && elem._attr("start", p.join(';'));
			var id = this.options.id = ("ptemplatejs_animate_" + (Math.random(100) * 100)).replace(/\./gim, ""),
				a = this.options.styleElem = $.createDom("style", {
					html: " ._current{animation: " + id + " " + (speed / 1000) + "s " + this.options.ease + " both;} @-webkit-keyframes " + id + " {from {" + p.join(';') + "} to {" + e.join(';') + "}}",
					id: id
				});
			$.query("head")[0]._append(a);
			elem._addClass('_current');
			elem._attr("animate_id", id);
			var then = function() {
				var elem = that.options.elem;
				elem.style.cssText = e.join(';');
				elem._removeClass("_current");
				$.query("#" + that.options.id)[0] && $.query("#" + that.options.id)[0]._remove();
				elem._off(that.endEventNames)._removeAttr("animate_id");
				callback && callback();
			};
			elem._off(this.endEventNames)._on(this.endEventNames, then);
			return this;
		}
		delay(time) {
			var that = this,
				p = [];
			this.stop(true);
			for (var i in this.options) p.push(this.options[i]);
			this.timeout = setTimeout(function() {
				that.play.apply(that, p);
			}, time || 500);
		}
		stop(bool) {
			var ops = $.extend({}, this.options.ops);
			for (var i in ops) {
				var val = win.getComputedStyle(this.options.elem, null).getPropertyValue(i);
				ops[i] = bool ? val : ops[i] + (!/px/.test(ops[i]) && /px/.test(val) ? "px" : "");
			}
			this.options.elem._removeClass("_current")._css(ops);
			$.query("#" + this.options.elem._attr("animate_id"))[0] && $.query("#" + this.options.elem._attr("animate_id"))[0]._remove();
			this.options.elem._off(this.endEventNames)._removeAttr("animate_id");
			!bool && this.options.callback && this.options.callback();
			return this;
		}
	}

	$.extend($.__mod__, {
		animate: function(elem, ops, speed, callback, ease) {
			new animate().play(elem, ops, speed, callback, ease);
		}
	});

	$.extend($.__mod__.pSubClass, {
		_animate: function(ops, speed, callback, ease) {
			$.__mod__.animate(this, ops, speed, callback, ease);
			return this;
		}
	});

	$.extend($, {
		animate: function(elem, ops, speed, callback, ease) {
			$.__mod__.animate(elem, ops, speed, callback, ease);
			return this;
		}
	});
})(this, pTemplate)