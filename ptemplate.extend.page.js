/*!
 * ptemplatejs v1.0.0
 * @author yandong
 *
 * https://github.com/ereddate/ptemplatejs
 */
'use strict';
typeof window.pTemplate != "undefined" && (function(win, $) {

	class Page {
		constructor(selector, props) {
			selector && (this.base = $.query(selector));
			props && $.extend(this, props);
			props && props.goal && (this.goalItems = this.base[0]._findNode(this.goal + "[" + (this.goalAttr || "data-src") + "]"));
			return this;
		}
		scrollShowImg(callback) {
			var that = this;
			$.query(window)._on("scroll", (e) => {
				this.scrollImgTimeout && clearTimeout(this.scrollImgTimeout);
				this.scrollImgTimeout = setTimeout(() => {
					that.loadedImgs = [];
					that.goalItems._each((i, item) => {
						var top = $.query(window)._scrollTop();
						if ((that.factor && that.factor($.query(item)[0], top) || ($.query(item)[0]._offset().top < top + screen.height)) && item._attr(that.goalAttr || "data-src")) {
							item._attr("src", item._attr(that.goalAttr || "data-src"))._removeAttr(that.goalAttr || "data-src");
							that.loadedImgs.push(item);
						}
					});
					callback && callback(that.loadedImgs);
				}, this.delay || 100);
			})._trigger("scroll");
			return {
				refresh: () => {
					that.goalItems = that.base[0]._findNode(that.goal + "[" + (that.goalAttr || "data-src") + "]");
					return that;
				}
			};
		}
		scrollLoadMore(callback) {
			var that = this;
			$.query(window)._on("scroll", (e) => {
				this.scrollTimeout && clearTimeout(this.scrollTimeout);
				this.scrollTimeout = setTimeout(() => {
					if (that.factor && that.factor(window) || ($.query(window)._scrollTop() + screen.height) >= $.query(document)[0]._height()) {
						callback && callback(that);
					}
				}, this.delay || 100);
			})._trigger("scroll");
			return {
				scroll: () => {
					$.query(window)._trigger("scroll");
					return that;
				}
			};
		}
		scrollUp(value) {
			value ? window.scrollTo(value, value) : window.scrollTo(0, 0);
			return this;
		}
		reload() {
			location.reload();
			return this;
		}
	}

	$.Page = (selector, options) => {
		return new Page(selector, options);
	}

	$.PageEvents = (options) => {
		if (options) {
			options.unload && $.query(document)._on("unload", options.unload);
			options.beforeunload && $.query(document)._on("beforeunload", options.beforeunload);
			options.load && $.ready((e) => {
				options.loaded && options.loaded.call(document, e);
			});
			$.query(document)._on("visibilitychange", () => {
				if (document.visibilityState === "hidden") {
					options.hidden && options.hidden.call(document);
				} else if (document.visibilityState === "visible") {
					options.visible && options.visible.call(document);
				}
			});
		}
	}

	/*
		$.PageEvents({
			loaded: () => {},
			unload: () => {},
			beforeunload: () => {},
			hidden: () => {},
			visible: () => {}
		})
	*/

})(window, window.pTemplate);