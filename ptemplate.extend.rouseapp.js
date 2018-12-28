/*!
 * ptemplatejs v1.0.0
 * @author yandong
 *
 * https://github.com/ereddate/ptemplatejs
 */
'use strict';
typeof window.pTemplate != "undefined" && ((win, $) => {

	var appApi = {},
		openappInterval = null,
		createNewUrl = (data, api) => {
			var urlScheme = api;
			if (data) {
				for (var item in data) {
					urlScheme = urlScheme + item + '=' + encodeURIComponent(data[item]) + "&";
				}
				urlScheme = urlScheme.substring(0, urlScheme.length - 1);
			}
			return urlScheme;
		},
		toClip = (message, success, error) => {
			var input = document.createElement("input");
			try {
				input.value = message;
				document.body.appendChild(input);
				input.select();
				input.setSelectionRange(0, input.value.length);
				document.execCommand('Copy', 'false', null);
				success && success();
			} catch (e) {
				console.log(e);
				error && error(e);
			}
			document.body.removeChild(input);
			return this;
		},
		downloadApp = (urls) => {
			setTimeout(function() {
				if ($.device.os.isiOS) {
					if ($.device.browser.isWechat || $.device.browser.isQQ) {
						window.location.href = urls.app.ios;
					} else {
						window.location.href = urls.browser.ios;
					}
				} else {
					if ($.device.browser.isWechat || $.device.browser.isQQ) {
						window.location.href = urls.app.android;
					} else {
						window.location.href = urls.browser.android;
					}
				}
			}, 200);
		},
		rouseApp = (app, base, rouseInit, rouseSuccess, rouseError) => {
			rouseInit && rouseInit();
			if (app.toOpenApp) {
				if ($.device.os.isAndroid) {
					if (!$.device.browser.isChrome) {
						var createIframe = (function() {
							var iframe;
							return function() {
								if (iframe) {
									return iframe;
								} else {
									iframe = document.createElement('iframe');
									iframe.style.display = 'none';
									document.body.appendChild(iframe);
									return iframe;
								}
							}
						})();
						createIframe.src = base;
					} else {
						location.href = base;
					}
				} else {
					location.href = base;
				}
				var a = 0;
				openappInterval && clearInterval(openappInterval);
				openappInterval = setInterval(function() {
					a += 1;
					if (a * 100 >= 3000) {
						clearInterval(openappInterval);
						if (document.hidden || document.webkitHidden) {
							console.log("open app ok");
							rouseSuccess && rouseSuccess();
						} else {
							console.log("open app err");
							rouseError && rouseError();
							downloadApp(app.downloads);
						}
					} else if (document.hidden || document.webkitHidden) {
						clearInterval(openappInterval);
						console.log("open app ok");
						rouseSuccess && rouseSuccess();
					}
				}, 100);
			}else{
				downloadApp(app.downloads);
			}
		};

	class Rouse {
		constructor(props) {
			props && $.extend(this, props);
			var that = this;
			typeof that.toOpenApp === "undefined" && (that.toOpenApp = true);
			that.rouse = (bool) => {
				console.log(that);
				var rouseAppURI = createNewUrl(that.data, appApi[that.type]);
				console.log(rouseAppURI);
				that.toClip && toClip(that.handle && that.handle.encodeClipMessage(that) || location.href, () => {
					console.log('toClip success');
					rouseApp(that, rouseAppURI, that.handle && that.handle.rousing, that.handle && that.handle.roused, that.handle && that.handle.error);
				}, () => {
					console.log('toClip error');
				}) || rouseApp(that, rouseAppURI, that.handle && that.handle.rousing, that.handle && that.handle.roused, that.handle && that.handle.error);;
			};
			return {
				click: (selector, callback) => {
					$.query(selector)[0]._click((e) => {
						callback && callback(() => that.rouse(true));
					});
				},
				appApi: appApi
			}
		}
	}

	$.rouseApp = (props) => {
		return new Rouse(props);
	};

})(window, pTemplate);