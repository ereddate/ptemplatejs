/*!
 * ptemplatejs v1.0.0
 * @author yandong
 *
 * https://github.com/ereddate/ptemplatejs
 */
'use strict';
typeof window.pTemplate != "undefined" && (function(win, $) {
	pTemplate.video = function(element, callback) {
		var xvideo = function(element) {
			return new xvideo.fn.init(element);
		};
		xvideo.forEach = function(array, callback) {
			var i, len = array.length;
			for (i = 0; i < len; i++) {
				var r = callback.call(array[i], i, array[i]);
				if (r === false) break;
			}
			return this;
		};
		xvideo.hasClass = function(elem, classname) {
			return new RegExp(classname, "gim").test(elem.className);
		};
		xvideo.addClass = function(elem, classname) {
			xvideo.removeClass(elem, classname);
			elem.className += " " + classname;
		};
		xvideo.removeClass = function(elem, classname) {
			elem.className = elem.className.replace(new RegExp(classname, "gim"), "");
		};
		xvideo.getTime = function(a, c) {
			c = c || a;
			var d = Math.floor(a % 60),
				e = Math.floor(a / 60 % 60),
				g = Math.floor(a / 3600),
				h = Math.floor(c / 60 % 60),
				k = Math.floor(c / 3600);
			if (isNaN(a) || Infinity === a) g = e = d = "-";
			g = 0 < g || 0 < k ? g + ":" : "";
			return g + (((g || 10 <= h) && 10 > e ? "0" + e : e) + ":") + (10 > d ? "0" + d : d)
		};
		xvideo.fn = xvideo.prototype = {
			init: function(element) {
				this.tags = element;
				return this;
			},
			ready: function(callback) {
				var dom = this.tags,
					header = document.getElementsByTagName("head")[0];
				if (dom) {
					var src = dom.getAttribute("src") || "",
						width = dom.getAttribute("width") || "100%",
						height = dom.getAttribute("height") || "240",
						autoplay = dom.getAttribute("autoplay") || "false",
						controls = dom.getAttribute("controls") || "false",
						loop = dom.getAttribute("loop") || "false";
					src = src.split(' ');
					dom.innerHTML = '<video id="videoplay" width="' + width + '" height="' + height + '" ' + (controls == "false" ? "" : "controls") + ' ' + (autoplay == "false" ? "" : "autoplay") + ' ' + (loop == "false" ? "" : "loop") + '></video><span id="videostatus" class="videostatus"></span><span id="status" class="netstate"></span>';
					var video = dom.getElementsByTagName("video")[0],
						videostatus = $.query("#videostatus", dom)[0],
						netstate = $.query("#status", dom)[0],
						oldVolume = 1,
						keys = {
							play: "播放",
							pause: "停止",
							volumechange: "音量",
							timeupdate: "播放中",
							netstate: ["", "正常", "下载数据", "未找到资源"],
							error: "错误",
							progress: "缓冲中，推荐暂停一会再播放",
							stalled: "网速过慢，播放器将暂停缓冲后再播放"
						};
					video.onloadstart = video.onprogress = video.onsuspend = video.onabort = video.onerror = video.onstalled = video.onplay = video.onpause = video.onloadedmetadata = video.onloadeddata = video.onwaiting = video.onplaying = video.oncanplay = video.oncanplaythrough = video.onseeking = video.onseeked = video.ontimeupdate = video.onended = video.onratechange = video.ondurationchange = video.oncontextmenu = video.onvolumechange = video.onfullscreenchange = function(e) {
						var netState = video.networkState;
						netstate.innerHTML = "网络:" + keys.netstate[netState];
						switch (e.type) {
							case "progress":
								videostatus.innerHTML = keys[e.type];
							case "error":
								videostatus.innerHTML = keys[e.type];
								break;
							case "play":
								var a = window.localStorage.getItem("timeupdate");
								videostatus.innerHTML = keys[e.type] + (a ? "从上次看到的" + xvideo.getTime(a, this.duration) + "开始..." : "");
								if (a) video.currentTime = a;
								break;
							case "stalled":
								videostatus.innerHTML = keys[e.type];
								break;
							case "pause":
								videostatus.innerHTML = keys[e.type];
								window.localStorage.setItem("timeupdate", this.currentTime.toFixed(2));
								break;
							case "volumechange":
								videostatus.innerHTML = video.volume === 0 ? "静音" : video.volume === 1 ? "音量最大" : keys[e.type] + (video.volume < oldVolume ? "缩小" : "放大");
								oldVolume = video.volume;
								break;
							case "timeupdate":
								videostatus.innerHTML = keys[e.type] + " " + xvideo.getTime(this.currentTime, this.duration);
								window.localStorage.setItem("timeupdate", this.currentTime.toFixed(2));
								break;
							case "contextmenu":
								e.preventDefault();
								break;
						}
					}
					dom.onclick = function(e) {
						if (video.paused) video.play();
						else video.pause();
					};
					dom.ondblclick = function(e) {
						if (!xvideo.hasClass(dom, "fullscreen")) {
							xvideo.addClass(dom, "fullscreen");
						} else {
							xvideo.removeClass(dom, "fullscreen");
						}
					}
					dom.appendChild = function(elem) {
						this.getElementsByTagName("video")[0].appendChild(elem);
					};
					xvideo.forEach(src, function(i, item) {
						var elem = document.createElement("source");
						elem.src = item;
						dom.appendChild(elem);
					});
					dom.removeAttribute('src');
					callback && callback();
					return dom;
				}
				return this;
			}
		};
		xvideo.fn.init.prototype = xvideo.fn;
		return xvideo(element).ready(callback);
	};
})(window, pTemplate);