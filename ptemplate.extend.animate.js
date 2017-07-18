/*!
 * ptemplatejs v1.0.0
 * @author yandong
 *
 * https://github.com/ereddate/ptemplatejs
 */
'use strict';
typeof window.pTemplate != "undefined" && (function(win, $) {

	class animate {
		constructor() {
			this.endEventNames = 'webkitAnimationEnd oAnimationEnd MSAnimationEnd animationend';
		}
		play(elem, ops, speed, callback, ease) {
			var that = this;
			this.options = {
				elem: elem,
				ops: ops,
				speed: speed,
				callback: callback,
				ease: ease || "ease"
			};
			var getStyle = win.getComputedStyle(elem, null),
				p = [],
				e = [];
			for (var i in ops) {
				var val = getStyle.getPropertyValue(i);
				p.push(i + ":" + val);
				e.push(i + ":" + ops[i] + (!/px/.test(ops[i]) && /px/.test(val) ? "px" : ""));
			}
			var id = ("ptemplatejs_animate_" + (Math.random(100) * 100)).replace(/\./gim, ""),
				a = $.createDom("style", {
					html: " ._current{animation: " + id + " " + (speed / 1000) + "s " + this.options.ease + " both;} @-webkit-keyframes " + id + " {from {" + p.join(';') + "} to {" + e.join(';') + "}}",
					id: id
				});
			$.query("head")[0]._append(a);
			elem._addClass('_current');
			elem._attr("animate_id", id);
			elem._off(this.endEventNames)._on(this.endEventNames, function() {
				this.style.cssText = e.join(';');
				this._removeClass("_current");
				$.query("#" + this._attr("animate_id"))[0] && $.query("#" + this._attr("animate_id"))[0]._remove();
				this._removeAttr("animate_id")._off(that.endEventNames);
				this._currentAnimate && (this._currentAnimate = null);
				callback && callback();
			});
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
			this.options.elem._off(this.endEventNames)._removeClass("_current")._css(ops);
			$.query("#" + this.options.elem._attr("animate_id"))[0] && $.query("#" + this.options.elem._attr("animate_id"))[0]._remove();
			this.options.elem._removeAttr("animate_id");
			this.options.elem._currentAnimate && (this.options.elem._currentAnimate = null);
			!bool && this.options.callback && this.options.callback();
			return this;
		}
	}

	$.extend($.__mod__, {
		animate: function(elem, ops, speed, callback, ease) {
			return new animate().play(elem, ops, speed, callback, ease);
		}
	});

	$.extend($.__mod__.pSubClass, {
		_animate: function(ops, speed, callback, ease) {
			$.extend(this, {
				_currentAnimate: $.__mod__.animate(this, ops, speed, callback, ease)
			});
			return this;
		}
	});

	$.extend($, {
		animate: function(elem, ops, speed, callback, ease) {
			return $.__mod__.animate(elem, ops, speed, callback, ease);
		}
	});
})(this, pTemplate)