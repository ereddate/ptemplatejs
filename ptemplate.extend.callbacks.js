/*!
 * ptemplatejs v1.0.0
 * @author yandong
 *
	var callbacks = $.Callbacks();
	callbacks.add((next) = > {
		next('a')
	}).add((next) => {
		next('b')
	}).fire('c', 'd').delay(1000, (next) => {
		next('e')
	}).done((a) => {
		console.log(a) //['a','b','c','d','e']
	});

 * https://github.com/ereddate/ptemplatejs
 */
'use strict';
typeof window.pTemplate != "undefined" && (function(win, $) {
	class Callbacks {
		constructor() {
			let args = arguments && [...arguments] || [],
				len = args.length,
				then = this;
			then.args = [];
			then.emit = [];
			len > 0 && args.forEach((a) => {
				then.add(a);
			});
		}
		add(callback, time) {
			let then = this;
			then.emit.push((done) => {
				setTimeout(() => {
					typeof Promise != "undefined" ? new Promise((resolve, reject) => {
						try {
							callback && callback.call(then, resolve);
						} catch (e) {
							console.log(e);
							reject(e);
						}
					}).then(done, done) : $.promise((resolve, reject) => {
						try {
							callback && callback.call(then, resolve);
						} catch (e) {
							console.log(e);
							reject(e);
						}
					}).then(done, done);
				}, time || 1)
			});
			return then;
		}
		fire() {
			var args = arguments,
				len = args.length;
			if (len>0){
				let then = this;
				then.emit.push((done) => {
					setTimeout(() => {
						this.args = this.args.concat([].slice.call(args));
						done();
					}, 1);
				});
			}
			return this;
		}
		delay(time, callback) {
			let then = this;
			then.emit.push((done) => {
				setTimeout(() => {
					typeof Promise != "undefined" ? new Promise((resolve, reject) => {
						try {
							callback && callback.call(then, resolve);
						} catch (e) {
							console.log(e);
							reject();
						}
					}).then(done, done) : $.promise((resolve, reject) => {
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
			let then = this;
			if (typeof Symbol != "undefined"){
				let a = then.emit[Symbol.iterator](),
					b = a.next();

				if (!b.done) {
					then.emit.splice(0, 1);
					b.value((d) => {
						d && then.args.push(d);
						then.done(function(){
							callback && callback.call(then, then.args);
						})
					})
				} else {
					callback && callback.call(then, then.args);
				}
			}else{
				var next = function(n){
					var len = then.emit.length;
					if (n>=len){
						callback && callback.call(then, then.args);
					}else{
						then.emit[n] && then.emit[n](function(d){
							d && then.args.push(d);
							next(n+1);
						});
					}
				};
				next(0);
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