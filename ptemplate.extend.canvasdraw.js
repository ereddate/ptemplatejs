/*!
 * ptemplatejs v1.0.0
 * @author yandong
 *
 * https://github.com/ereddate/ptemplatejs
 */
'use strict';
typeof window.pTemplate != "undefined" && (function(win, $, isCanvas) {
	$.ready(function() {
		$.isCanvas = isCanvas();
		$.canvasDraw = function(select, ops) {
			var doc = window.document;

			var drawARC = function(canvas, ops) {
				return new drawARC.fn.init(canvas, ops);
			};
			Array.prototype.del = function(num) {
				this.splice(num, 1);
				return this;
			};

			function emiExec(emi) {
				var len = emi.length,
					i = 0,
					self, val, style, r;

				function b(i) {
					if (emi[i]) {
						self = emi[i].target;
						val = emi[i].val;
						style = emi[i].style;
						r = emi[i].r;
						a();
					}
				}

				function a() {
					setTimeout(function() {
						drawARC.drawARC(self.ctx, self.x, self.y, r || self.r[0], self.sRage, Math.PI * 2 * (self.count / 360) + self.sRage, style || "rgba(0,0,255,1)", function() {
							self.count++;
							drawARC.drawARC(self.ctx, self.x, self.y, self.r[1], 0, Math.PI * 2, self.style[1]);
							drawARC.drawString(self.ctx, ((1 - (360 - self.count) / 360) * 100).toFixed(0) + "%", self.x - 9, self.y + 5, "left", style || "rgba(0,0,255,1)");
							if (self.count <= 360 / 100 * val) {
								a();
							} else {
								emi.del(0);
								self.count = 0;
								b(0);
							}
						});
					}, self.time);
				}
				b(0);
			}
			drawARC.fn = drawARC.prototype = {
				init: function(canvas, ops) {
					this.ctx = canvas.ctx;
					this.sRage = -Math.PI * 0.5;
					this.count = 0;
					this.time = ops && ops.time || 10;
					this.x = ops && ops.x || 0;
					this.y = ops && ops.y || 0;
					this.r = ops && ops.r || [0, 0];
					this.emi = [];
					this.value = ops && ops.val || 100;
					this.style = ops && ops.style || ["rgba(192,192,192, 1)", "rgba(255,255,255,1)"];
					drawARC.drawARC(this.ctx, this.x, this.y, this.r[0], 0, Math.PI * 2, this.style[0]);
					drawARC.drawARC(this.ctx, this.x, this.y, this.r[1], 0, Math.PI * 2, this.style[1]);
					return this;
				},
				draw: function(val, style, r) {
					var self = this;
					self.emi.push({
						val: val || this.value,
						style: style,
						r: r,
						target: self
					});
					return this;
				},
				done: function() {
					emiExec(this.emi);
				}
			};
			drawARC.fn.init.prototype = drawARC.fn;
			drawARC.drawARC = function(ctx, x, y, width, start, end, style, callback) {
				if (ctx) {
					ctx.beginPath();
					ctx.moveTo(x, y);
					ctx.arc(x, y, width, start, end);
					ctx.fillStyle = style;
					ctx.closePath();
					ctx.fill();
					callback && callback();
				}
				return this;
			};
			drawARC.drawString = function(ctx, text, x, y, dir, style) {
				if (ctx) {
					ctx.save();
					ctx.fillStyle = style || module.color.black;
					ctx.textAlign = dir || "right";
					ctx.fillText(text, x, y);
					ctx.restore();
				}
				return this;
			};

			var draw = function(select, ops) {
				return draw.fn.init(select, ops);
			};
			draw.fn = draw.prototype = {
				init: function(selector, ops) {
					if ($.isCanvas) {
						var parent = $.query(selector)[0],
							canvas = doc.createElement("canvas");

						canvas.id = (Math.random(10000) + "").replace(".", "");
						canvas.parent = parent;
						canvas.width = ops.width || screen.width;
						canvas.height = ops.height || 200;
						ops.style && (canvas.style.cssText = ops.style);
						canvas.ctx = canvas.getContext("2d");
						canvas.sRage = -Math.PI * 0.5;
						canvas.start = 0;
						parent._append(canvas);
						$.extend(this, {
							parent: parent,
							canvas: canvas,
							ctx: canvas.ctx
						});
						return this;
					} else {
						return;
					}
				},
				setData: function(callback) {
					callback && (this.canvas.baseData = callback(this.canvas));
					return this;
				}
			};
			draw.fn.init.prototype = draw.fn;

			$.extend(draw.fn, {
				clearRect: function() {
					this.canvas.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
					return this;
				},
				drawDashLine: function(style, width, dir, data) {
					var self = this;
					data = data || self.canvas.baseData;
					var ctx = self.canvas.ctx,
						i, len = data.length;
					ctx.strokeStyle = draw.color[style] || style;
					ctx.lineWidth = width;
					ctx.save();
					if (typeof data == "function") {
						self.drawDashLine(style, width, data(canvas, function(canvas) {
							self.canvas = canvas;
						}));
					} else {
						ctx.beginPath();
						for (let i = 0; i < len; i++) {
							if (data[i].from && data[i].to) {
								var p = dir == "left" ? data[i].to[0] : data[i].to[1] / 5;
								var fx = data[i].from[0],
									fy = data[i].from[1],
									tx = data[i].to[0],
									ty = data[i].to[1];
								for (let x = 0; x < p; x++) {
									if (x % 2 === 0) {
										ctx.moveTo(dir == "left" ? fx + 5 * x : fx, dir != "left" ? fy + 5 * x : fy);
									} else {
										ctx.lineTo(dir == "left" ? fx + 5 * x : fx, dir != "left" ? ty + 5 * x : ty);
									}
								}
							}
						}
						ctx.stroke();
					}
					return self;
				},
				drawLine: function(style, width, data) {
					var self = this;
					data = data || self.canvas.baseData;
					let canvas = self.canvas;
					var ctx = canvas.getContext("2d"),
						i, len = data.length;
					ctx.strokeStyle = draw.color[style] || style;
					ctx.lineWidth = width;
					ctx.save();
					if (typeof data == "function") {
						self.drawLine(style, width, data(canvas, function(rcanvas) {
							self.canvas = rcanvas;
						}));
					} else {
						for (i = 0; i < len; i++) {
							if (data[i].from && data[i].to) {
								ctx.beginPath();
								var fx = data[i].from[0],
									fy = data[i].from[1];
								ctx.moveTo(fx, fy);
								var tx = data[i].to[0],
									ty = data[i].to[1];
								ctx.lineTo(tx, ty);
								ctx.stroke();
							}
						}
					}
					return self;
				},
				drawString: function(text, x, y, dir, style) {
					var ctx = this.ctx;
					ctx.save();
					ctx.fillStyle = draw.color[style] || style || draw.color.black;
					ctx.textAlign = dir || "right";
					ctx.fillText(text, x, y);
					ctx.restore();
					return this;
				},
				drawArcLoad: function(x, y, val, style, width) {
					drawARC(this.canvas, {
						x: x,
						y: y,
						r: [0, 20]
					}).draw(val, draw.color[style] || style, width).done();
					return this;
				},
				drawARC: function(x, y, r, style) {
					drawARC.drawARC(this.canvas.ctx, x, y, r, 0, Math.PI * 2, style);
					return this;
				},
				drawCurve: function(style, width, data) {
					var self = this;
					data = data || self.canvas.baseData;
					var canvas = self.canvas,
						ctx = canvas.ctx,
						i, len = data.length;
					ctx.strokeStyle = draw.color[style] || style;
					ctx.lineWidth = width;
					ctx.save();
					if (typeof data == "function") {
						self.drawCurve(style, width, data(canvas, function(canvas) {
							self.canvas = canvas;
						}));
					} else if (data[0]) {
						ctx.beginPath();
						for (i = 0; i < len; i++) {
							if (i === 0) {
								ctx.moveTo(data[i].from[0], data[i].from[1]);
							} else {
								ctx.lineTo(data[i].to[0], data[i].to[1]);
							}
						}
						ctx.stroke();
					}
					ctx.closePath();
					ctx.restore();
					return this;
				},
				drawViewLine: function(style, width) {
					var canvas = this.canvas;
					this.drawLine(style, width, [{
						from: [0, 0],
						to: [canvas.width, 0]
					}, {
						from: [canvas.width, 0],
						to: [canvas.width, canvas.height]
					}, {
						from: [canvas.width, canvas.height],
						to: [0, canvas.height]
					}, {
						from: [0, canvas.height],
						to: [0, 0]
					}]);
					return this;
				}
			});

			$.extend(draw, {
				color: {
					red: "rgba(255,0,0,1)",
					green: "rgba(50,205,50,1)",
					blue: "rgba(30,144,255,1)",
					black: "rgba(0,0,0,1)",
					powder: "rgba(255,0,255,1)",
					lightgrey: "rgba(211,211,211,1)"
				}
			});

			return draw(select, ops);
		};
	});

})(window, pTemplate, function() {
	var a = document.createElement("canvas");
	document.body.appendChild(a);
	var bool = a.getContext ? true : false;
	document.body.removeChild(a);
	return bool;
});