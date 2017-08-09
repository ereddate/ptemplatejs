/*!
 * ptemplatejs v1.0.0
 * @author yandong
 *
 * https://github.com/ereddate/ptemplatejs
 */
'use strict';
typeof window.pTemplate != "undefined" && (function(win, $) {
	class Callbacks {
		constructor() {
			let args = arguments && [...arguments] || [],
				len = args.length,
				then = this;
			then.emit = [];
			len > 0 && args.forEach((a) => {
				then.add(a);
			});
		}
		add(callback) {
			let then = this;
			then.emit.push((done) => {
				setTimeout(() => {
					new Promise((resolve, reject) => {
						try {
							callback && callback.call(then, resolve);
						} catch (e) {
							console.log(e);
							reject();
						}
					}).then(done, done);
				}, 25)
			});
			return then;
		}
		delay(time, callback) {
			let then = this;
			then.emit.push((done) => {
				setTimeout(() => {
					new Promise((resolve, reject) => {
						try {
							callback && callback.call(then, resolve);
						} catch (e) {
							console.log(e);
							reject();
						}
					}).then(done, done);
				}, time || 1000);
			});
			return then;
		}
		done(callback) {
			let then = this,
				a = then.emit[Symbol.iterator](),
				b = a.next();
			if (!b.done) {
				then.emit.splice(0, 1);
				b.value(() => {
					then.done(callback)
				})
			} else {
				callback && callback.call(then);
			}
			return then;
		}
	}

	$.Callbacks = function() {
		let args = arguments && [...arguments] || [],
			len = args.length,
			callback = new Callbacks();
		if (len > 0) args.forEach((a) => {
			callback.add(a);
		});
		return callback;
	};
})(window, pTemplate);