/*!
 * ptemplatejs v1.0.0
 * @author yandong
 *
 * https://github.com/ereddate/ptemplatejs
 */
'use strict';
typeof window.pTemplate != "undefined" && ((win, $) => {

	class Html5Api {
		constructor(props) {
			props && $.extend(this, props);
			return this;
		}
		vibrate(time) {
			navigator.vibrate && navigator.vibrate(time);
			return {
				has: () => {
					return navigator.vibrate ? true : false;
				}
			};
		}
		fullscreen(elem) {
			var that = this;
			return {
				on: function(handleChange) {
					$.query(elem)[0]._on("fullscreenchange webkitfullscreenchange mozfullscreenchange", function(e) {
						handleChange && handleChange.call(this, e);
					});
					return this;
				},
				requestFullScreen: function() {
					if (elem.webkitRequestFullScreen) {
						elem.webkitRequestFullScreen();
					} else if (elem.mozRequestFullScreen) {
						elem.mozRequestFullScreen();
					} else if (elem.requestFullscreen) {
						elem.requestFullscreen();
					}
					return this;
				},
				cancelFullScreen: function() {
					if (elem.webkitCancelFullScreen) {
						elem.webkitCancelFullScreen();
					} else if (elem.mozCancelFullScreen) {
						elem.mozCancelFullScreen();
					} else if (elem.exitFullscreen) {
						elem.exitFullscreen();
					}
					return this;
				},
				has: () => {
					return elem.webkitRequestFullScreen || elem.mozRequestFullScreen || elem.requestFullscreen ? true : false;
				}
			};
		}
		history() {
			var that = this;
			var history = window.history;
			return {
				on: function(popstate) {
					$.query(window)._on("popstate", function(e) {
						popstate && popstate.call(this, e);
					})._trigger('popstate');
					return this;
				},
				push: function(state, title, url) {
					history && history.pushState(state, title, url);
					return this;
				},
				replace: function(state, title, url) {
					history && history.replaceState(state, title, url);
					return this;
				},
				has: () => {
					return history && history.pushState ? true : false;
				}
			}
		}
		message(messageCallback) {
			var that = this;
			return {
				post: function(elem, message) {
					elem.postMessage && elem.postMessage(message);
					return this;
				},
				has: () => {
					return window.postMessage ? true : false;
				},
				on: function(messageCallback) {
					$.query(window)._on("message", function(e) {
						messageCallback && messageCallback.call(this, e, e.data, (message) => {
							e.source.postMessage(message);
						});
					});
					return this;
				}
			}
		}
		userMedia() {
			var getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
			return {
				has: () => {
					return getUserMedia ? true : false;
				},
				done: function(constraints, successCallback, errorCallback) {
					if (getUserMedia) {
						getUserMedia(constraints, successCallback, errorCallback);
					}
					return this;
				}
			};
		}
		orientation() {
			return {
				has: () => {
					return window.DeviceOrientationEvent ? true : false;
				},
				on: function(callback) {
					if (window.DeviceOrientationEvent) {
						$.query(window)._on("deviceorientation", function(e) {
							callback && callback.call(this, e, e.alpha, e.beta, e.gamma);
						})
					}
					return this;
				}
			};
		}
		motion(callback) {
			return {
				has: () => {
					return window.DeviceMotionEvent ? true : false;
				},
				on: function(callback) {
					if (window.DeviceMotionEvent) {
						$.query(window)._on('devicemotion', function(e) {
							callback && callback.call(this, e, e.acceleration && {
								x: e.acceleration.x,
								y: e.acceleration.y,
								z: e.acceleration.z
							}, e.accelerationIncludingGravity && {
								x: e.accelerationIncludingGravity.x,
								y: e.accelerationIncludingGravity.y,
								z: e.accelerationIncludingGravity.z
							}, e.rotationRate && {
								alpha: e.rotationRate.alpha,
								beta: e.rotationRate.beta,
								gamma: e.rotationRate.gamma
							}, e.interval);
						})
					}
					return this;
				}
			};
		}
		geolocation() {
			var geolocation = navigator.geolocation;
			return {
				currentPosition: function(args, success, error) {
					geolocation && geolocation.getCurrentPosition(success, error, args);
					return this;
				},
				watchPosition: function(success, error) {
					geolocation && geolocation.watchPosition(success, error);
					return this;
				},
				clearWatch: function(id) {
					geolocation && clearWatch(id);
					return this;
				},
				has: () => {
					return geolocation ? true : false;
				}
			}
		}
		video(elem, args) {
			var video = $.DOM.video(args);
			$.query(elem)[0]._append(video);
			var returnObj = {
				DOM: video
			};
			["abort", "canplay", "canplaythrough", "durationchange", "emptied", "ended", "error", "loadeddata", "loadedmetadata", "loadstart", "pause", "play", "playing", "progress", "ratechange", "seeked", "seeking", "stalled", "suspend", "timeupdate", "volumechange", "waiting"]._each((i, name) => {
				$.extend(returnObj, {
					[name]: (callback) => {
						video._on(name, function(e) {
							callback && callback.call(this, e);
						});
						return this;
					}
				});
			});
			return returnObj;
		}
		audio(elem, args) {
			var audio = $.DOM.audio(args);
			$.query(elem)[0]._append(audio);
			var returnObj = {
				DOM: audio
			};
			["loadstart", "progress", "play", "pause", "ended", "timeupdate", "canplaythrough", "canplay"]._each((i, name) => {
				$.extend(returnObj, {
					[name]: (callback) => {
						audio._on(name, function(e) {
							callback && callback.call(this, e);
						});
						return this;
					}
				});
			});
			return returnObj;
		}
		storage() {
			var localStorage = window.localStorage;
			return {
				set: function(name, val) {
					localStorage && localStorage.setItem(name, val);
					return this;
				},
				get: (name) => {
					return localStorage && localStorage.getItem(name);
				},
				remove: function(name) {
					localStorage && localStorage.removeItem(name);
					return this;
				},
				clear: function() {
					localStorage && localStorage.clear();
					return this;
				},
				has: () => {
					return localStorage ? true : false;
				}
			}
		}
	}

	$.html5api = function(args) {
		return new Html5Api(args);
	}

})(window, pTemplate)