/*!
 * ptemplatejs v1.0.0
 * @author yandong
 *
 * https://github.com/ereddate/ptemplatejs
 */
'use strict';
typeof window.pTemplate != "undefined" && (function(win, $) {
	!$.__mod__.touch && ($.__mod__.touch = {});
	$.extend($.__mod__.touch, {
		pinched: function(selector, callback) {
			function getDistance(p1, p2) {
				var x = p2[0] - p1[0],
					y = p2[1] - p1[1];
				return Math.sqrt((x * x) + (y * y));
			}
			var dom = $.query(selector)[0],
				touchend = function(e) {
					if (this.isOnTouch > 0) {
						var touchs = e.changedTouches,
							len = touchs.length;
						this.isOnTouch += 1;
						if (len > 1) {
							this.endX = [touchs[0].clientX, touchs[1].clientX];
							this.endY = [touchs[0].clientY, touchs[1].clientY];
							var v = getDistance([this.endX[0], this.endY[0]], [this.endX[1], this.endY[1]]) / getDistance([this.startX[0], this.startY[0]], [this.startX[1], this.startY[1]]);
							if (v < 1) {
								callback && callback.call(this, e, "zoomIn");
							} else {
								callback && callback.call(this, e, "zoomOut");
							}
						} else if (e.scale && e.scale <= 1) {
							callback && callback.call(this, e, "zoomIn");
						} else if (e.scale && e.scale > 1) {
							callback && callback.call(this, e, "zoomOut");
						}
					}
					dom._off("touchend", touchend);
				};
			dom._on("touchstart", function(e) {
				this.isOnTouch = 0;
				var touchs = e.targetTouches,
					len = touchs.length;
				if (len > 1) {
					this.isOnTouch += 1;
					this.startX = [touchs[0].clientX, touchs[1].clientX];
					this.startY = [touchs[0].clientY, touchs[1].clientY];
				}
				dom._on("touchend", touchend);
			})._on("touchmove", function(e) {
				e.preventDefault();
			});
			return this;
		},
		swipe: function(selector, options) {
			var browser = {
				addEventListener: !!window.addEventListener,
				touch: ("ontouchstart" in window) || window.DocumentTouch && document instanceof DocumentTouch
			};
			if (typeof options == "function") {
				options = $.extend({}, {
					callback: options
				});
			} else {
				options = $.extend({}, options);
			}
			var start = {},
				delta = {},
				end = {};

			function calculateAngle(startPoint, endPoint) {
				var x = startPoint.x - endPoint.x;
				var y = endPoint.y - startPoint.y;
				var r = Math.atan2(y, x); 
				var angle = Math.round(r * 180 / Math.PI);
				if (angle < 0) {
					angle = 360 - Math.abs(angle);
				}

				return angle;
			}

			function calculateDirection(startPoint, endPoint) {
				var angle = calculateAngle(startPoint, endPoint);

				if ((angle <= 45) && (angle >= 0)) {
					return "left";
				} else if ((angle <= 360) && (angle >= 315)) {
					return "left";
				} else if ((angle >= 135) && (angle <= 225)) {
					return "right";
				} else if ((angle > 45) && (angle < 135)) {
					return "down";
				} else {
					return "up";
				}
			}

			function init(element) {
				var events = {
					handleEvent: function(event) {
						switch (event.type) {
							case "touchstart":
								this.start(event);
								break;
							case "touchmove":
								this.move(event);
								break;
							case "touchend":
								this.end(event);
								break;
						}
						if (options.stopPropagation) {
							event.stopPropagation()
						}
					},
					start: function(event) {
						var touches = event.touches[0];
						start = {
							x: touches.pageX,
							y: touches.pageY
						};
						delta = {};
						element.addEventListener("touchmove", this, false);
						element.addEventListener("touchend", this, false)
					},
					move: function(event) {
						if (event.touches.length > 1 || event.scale && event.scale !== 1) {
							return
						}
						if (options.disableScroll) {
							event.preventDefault()
						}
						var touches = event.touches[0];
						end = {
							x: touches.pageX,
							y: touches.pageY
						};
						delta = {
							x: touches.pageX - start.x,
							y: touches.pageY - start.y
						};
					},
					end: function(event) {
						var direction = calculateDirection(start, end);
						var a = 150;
						((delta.x < -a || delta.x > a) || (delta.y < -a || delta.y > a)) && options.callback && options.callback.call(element, event, direction);
						element.removeEventListener("touchmove", events, false);
						element.removeEventListener("touchend", events, false)
					}
				};
				if (browser.addEventListener) {
					if (browser.touch) {
						element.addEventListener("touchstart", events, false)
					}
				}
			}

			var target = $.query(selector);

			$.each(target, function() {
				var element = this;
				init(element);
			});


			return {
				done: function(callback) {
					options.callback = callback;
					return this;
				},
				off: function() {
					if (browser.addEventListener) {
						$.each(target, function() {
							$.query(this)._off("touchstart");
						});
					}
					return this;
				}
			};
		},
		tap: function(selector, callback) {
			var dom = $.query(selector)[0],
				start,
				end, deltaX, deltaY, startTime, endTime, doubleTime;
			dom._on("touchstart", function(e) {
				var touches = event.touches[0];
				startTime = new Date();
				start = {
					x: touches.pageX,
					y: touches.pageY
				};
				end = {
					x: 0,
					y: 0
				};
				deltaX = 0;
				deltaY = 0;
				endTime = null;
			})._on("touchmove", function(e) {
				var touches = event.touches[0];
				end = {
					x: touches.pageX,
					y: touches.pageY
				};
			})._on("touchend", function(e) {
				endTime = new Date();
				deltaX = end.x - start.x;
				deltaY = end.y - start.y;
				if (deltaX <= 10 && deltaY <= 10 && endTime - startTime > 500) {
					callback && callback.call(this, e, "singleTap", endTime - startTime);
					doubleTime = null;
				} else if (deltaX <= 10 && deltaY <= 10 && endTime - doubleTime < 500) {
					callback && callback.call(this, e, "doubleTap", endTime - doubleTime);
				} else {
					doubleTime = endTime;
				}
			});
			return this;
		},
		"3dtouch": function(selector, callback){
			var dom = $.query(selector)[0],
				start,
				end, deltaX, deltaY, startTime, endTime, doubleTime;
			dom._on("touchstart", function(e) {
				var touches = event.touches[0];
				startTime = new Date();
				start = {
					x: touches.pageX,
					y: touches.pageY
				};
				end = {
					x: 0,
					y: 0
				};
				deltaX = 0;
				deltaY = 0;
				endTime = null;
			})._on("touchmove", function(e) {
				var touches = event.touches[0];
				end = {
					x: touches.pageX,
					y: touches.pageY
				};
			})._on("touchend", function(e) {
				var top = document.documentElement.scrollTop || document.body.scrollTop;
				endTime = new Date();
				deltaX = end.x - start.x;
				deltaY = end.y - start.y;
				if (deltaX <= 10 && deltaY <= 10 && endTime - startTime > 900) {
					callback && callback.call(this, e, {x: start.x, y: start.y-top});
					doubleTime = null;
				} else {
					doubleTime = endTime;
				}
			});
			return this;
		}
	});
})(window, pTemplate);