/*!
 * ptemplatejs v1.0.0
 * @author yandong
 *
 * https://github.com/ereddate/ptemplatejs
 */
'use strict';
typeof window.pTemplate != "undefined" && (function(win, $) {
	Array.prototype.del = function(num) {
		this.splice(num, 1);
		return this;
	};
	class PP {
		constructor(fn) {
			var that = this;
			that.resolveCallbacks = null;
			that.status = "pending";
			that.value = null;
			that.ErrValue = null;

			that.then = (resolve, reject) => {
				if (this.status === "pending") {
					resolve && (this.resolveCallbacks = resolve);
					reject && (this.rejectCallback = reject);
				} else if (this.status === "rejected") {
					return reject && reject(this.Error) || this;
				} else {
					try {
						return resolve && resolve(this.value) || this;
					} catch (e) {
						this.status = "rejected";
						this.Error = e;
						return reject && reject(this.Error) || this;
					}
				}
				return this;
			}
			that.always = (callback) => {
				if (this.status === "pending") {
					callback && (this.alwaysCallback = callback)
				} else {
					this.status = "completed";
					return callback && callback(this.value) || this;
				}
				return this;
			}
			that.wait = (time, resolve, reject) => {
				var that = this;
				setTimeout(() => {
					that.then(resolve, reject);
				}, time);
				return this;
			}

			fn((args) => {
				that.value = args;
				that.status = "fulfilled";
				try {
					that.resolveCallbacks && that.resolveCallbacks(that.value);
				} catch (e) {
					that.status = "rejected";
					that.Error = e;
					that.rejectCallback && that.rejectCallback(that.Error);
				}
			}, (args) => {
				that.status = "rejected"
				that.Error = args;
				that.rejectCallback && that.rejectCallback(that.Error);
			});

			return this;
		}
	}

	class When {
		constructor() {
			var args = arguments,
				len = args.length,
				that = this;

			that.cbs = [].slice.call(args);
			return this;
		}
		then(resolve, reject, alwaysFn) {
			this.cbs.forEach((cb) => {
				new PP(cb).then((a) => {
					resolve && resolve(a);
				}, (e) => {
					reject && reject(e)
				}).always((a) => {
					alwaysFn && alwaysFn(a)
				});
			});
			return this;
		}
	}

	$.promise = (callback) => {
		return new PP(callback);
	};
	$.promise.when = () => {
		return new When.apply(this, arguments);
	};
})(window, pTemplate);