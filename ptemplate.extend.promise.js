/*!
 * ptemplatejs v1.0.0
 * @author yandong
 *
 * https://github.com/ereddate/ptemplatejs
 */
'use strict';
typeof window.pTemplate != "undefined" && (function(win, $){
	Array.prototype.del = function(num) {
		this.splice(num, 1);
		return this;
	};
	var promise = function(callback) {
		return new promise.fn.init(callback);
	};
	promise.statusList = ["init", "exec", "success", "error", "complete"];
	promise.fn = promise.prototype = {
		init: function(callback) {
			this.status = promise.statusList[0];
			var self = this,
				resolve = function() {
					self.thenArgs = arguments;
					self.status = promise.statusList[2];
					emi.call(self, 0, self.emi);
				},
				reject = function() {
					self.catchArgs = arguments;
					self.status = promise.statusList[3];
					emi.call(self, 0, self.emi);
				};
			this.emi = [];
			this.id = "_promise_" + (Math.random(10000) + "").replace(".", "");
			this.done = function() {
				if (!self.catchArgs && self.status == promise.statusList[0]) {
					callback ? callback.call(self, resolve, reject) : emi.call(self, 0, self.emi);
					self.status = promise.statusList[1];
				} else if (!callback) {
					emi.call(self, 0, self.emi);
				}
			};
			return this;
		},
		then: function(callback) {
			this.emi.push({
				callback: callback,
				args: this.thenArgs,
				type: "then"
			});
			this.done();
			return this;
		},
		catch: function(callback) {
			this.emi.fail = {
				callback: callback,
				args: this.catchArgs
			};
			this.done();
			return this;
		},
		always: function(callback) {
			this.emi.always = {
				callback: callback,
				args: this.thenArgs || this.catchArgs
			};
			this.done();
			return this;
		}
	};
	promise.fn.init.prototype = promise.fn;
	$.extend(promise.fn, {
		wait: function(ms) {
			this.emi.push({
				callback: function(callback) {
					setTimeout(function() {
						callback && callback();
					}, ms * 1000);
				},
				type: "wait"
			});
			return this;
		}
	});
	var emi = function(n, arr) {
			var self = this;
			if (this.catchArgs) {
				this.emi.fail && this.emi.fail.callback && (this.emi.fail.callback.call(this, this.catchArgs && this.catchArgs[0] || this.catchArgs), this.emi.fail = null) || console.log(this.catchArgs[0]);
				this.emi.always && this.emi.always.callback && this.emi.always.callback.call(this, this.thenArgs || this.catchArgs, this.emi.always = null);
				this.status = promise.statusList[4];
				return;
			} else if (arr.length > 0) {
				var _emi = function(n, arr) {
					if (arr.length > 0) {
						var self = this,
							item = arr[n];
						if (item.type == "wait") {
							item.callback(function() {
								arr.del(n);
								_emi.call(self, n, arr);
							});
						} else {
							try {
								item.callback && item.callback.apply(self, item.args || self.thenArgs || []);
							} catch (e) {
								console.log(e);
							} finally {
								arr.del(n);
								_emi.call(self, n, arr);
							}
						}
					} else {
						this.emi.always && this.emi.always.callback && (this.emi.always.callback.call(this, this.thenArgs || this.catchArgs), this.emi.always = null);
						this.status = promise.statusList[4];
					}
				}
				_emi.call(self, n, arr);
			}
		},
		set = function() {
			var args = arguments,
				len = args.length,
				i;
			for (i = 0; i < len; i++) this.emi.push({
				callback: function(callback) {
					return promise(function(resolve, reject) {
						if (typeof callback == "function") {
							callback && callback(resolve, reject);
						} else {
							try {
								resolve(callback);
							} catch (e) {
								reject(e.message);
							}
						}
					});
				},
				args: args[i]
			});
			return this;
		};
	var when = function() {
		var obj = (new when.fn.init());
		return set.apply(obj, arguments);
	};
	when.fn = when.prototype = {
		init: function() {
			this.emi = [];
			return this;
		}
	};
	$.extend(when.fn, {
		done: function(callback) {
			this.emi.then = callback;
			whenEmi.call(this, "then");
			return this;
		},
		catch: function(callback) {
			this.emi.fail = callback;
			whenEmi.call(this, "fail");
			return this;
		}
	});
	var whenEmi = function(type) {
		var self = this,
			len = self.emi.length,
			i, x,
			thenLen = self.emi.then.length || 0;
		for (i = 0; i < len; i++) {
			self.emi[i].callback ? (self.emi[i] = self.emi[i].callback(self.emi[i].args), self.emi[i][type](self.emi[type])) : self.emi[i][type](self.emi[type]);
		}
	}
	when.fn.init.prototype = when.fn;
	promise.when = when;

	$.promise = promise;
})(window, pTemplate);