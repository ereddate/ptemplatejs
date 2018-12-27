/*!
 * ptemplatejs v1.0.0
 * @author yandong
 *
 * https://github.com/ereddate/ptemplatejs

	var progress = $.Progress();

	progress.end();  //结束前面的进度
	progress.start(() => {
		执行前操作
	}, (next) => {
		执行中操作
		next(); //执行完成
	}, () => {
		执行后操作
	});

	还有其他方法提供：
	progress.init(); //初始化
	progress.timeupdate(int val); //进度值
	progress.destroy();  //销毁进度条

	router页面跳转时推荐与unload配合使用。

 */
'use strict';
typeof window.pTemplate != "undefined" && ((win, $) => {
	var progressInterval = null,
		progressTimeout = null;
	class Progress {
		constructor() {
			this.Elem = $.DOM.div({
				cls: "progress"
			}, $.DOM.div({
				cls: "progress_bar"
			}));
			if ($.query(".progress")[0]) $.query(".progress")[0]._remove();
			$.query("head")[0]._append($.DOM.style({
				html: ".progress{position:fixed;top:0;left:0;right:0;z-index:999998;width:100%;height:" + (2.5 / 23.44) + "rem;background-color:#666}.progress_bar{position:fixed;top:0;left:0;right:0;z-index:999999;background-color:#dc143c;width:0;height:" + (2.5 / 23.44) + "rem;-webkit-box-shadow:#b91f1f 1px 0 6px 1px;border-radius:" + (2.5 / 23.44) + "rem;}"
			}));
			return this
		}
		init() {
			progressInterval && clearInterval(progressInterval);
			this.startTime = new Date();
			this.totalTime = 3000;
			this.currentTime = 0;
		}
		timeupdate(val) {
			$.query(".progress_bar")[0] && $.query(".progress_bar")[0]._css({
				width: (val * 100) + "%"
			});
		}
		start(before, executing, callback) {
			var args = arguments,
				len = args.length;
			var that = this;
			$.query("body")[0]._append(this.Elem);
			if (len === 1) {
				executing = before;
				before = null;
				callback = null;
			}
			this.timeupdate(0);
			progressInterval = setInterval(() => {
				that.currentTime += 150;
				if (that.currentTime > 100 && that.currentTime < 250) {
					before && before();
				}
				if (that.currentTime > 500 && that.currentTime < 650) {
					executing && executing(() => {
						that.end(() => {
							that.destroy(callback);
						});
					});
				}
				that.timeupdate((that.currentTime / that.totalTime).toFixed(2));
			}, 150);
		}
		end(callback) {
			var that = this;
			this.timeupdate(1);
			this.init();
			progressTimeout && clearTimeout(progressTimeout);
			progressTimeout = setTimeout(() => {
				callback && callback();
			}, 500);
		}
		destroy(callback) {
			$.query(".progress")[0] && $.query(".progress")[0]._remove();
			callback && callback();
		}
	}

	$.Progress = function() {
		return new Progress();
	}
})(window, pTemplate);