/*!
 * ptemplatejs v1.0.0
 * @author yandong
 *
 * https://github.com/ereddate/ptemplatejs
 */
'use strict';
typeof window.pTemplate != "undefined" && (function(win, $) {
	var ua = navigator.userAgent.toLowerCase(),
		device = {
			os: {
				version: 0,
				isiOS: ua.indexOf("iphone") > -1 || ua.indexOf("ipad") > -1 || ua.indexOf("ios") > -1,
				isAndroid: ua.indexOf("android") > -1 || ua.indexOf("adr") > -1 || ua.indexOf("linux;") > -1
			},
			browser: {
				version: 0,
				isQQ: ua.indexOf("qq/") > -1,
				isqqbrowser: ua.indexOf("mqqbrowser/") > -1,
				isUC: ua.indexOf("ucbrowser/") > -1 || ua.indexOf("ucweb/") > -1,
				isWechat: ua.indexOf("micromessenger/") > -1,
				isSamsung: ua.indexOf("samsungbrowser/") > -1,
				isSogou: ua.indexOf("sogoumobilebrowser/") > -1,
				isPinganWifi: ua.indexOf("pawifi") > -1,
				isChrome: ua.indexOf('chrome') > -1,
				isOpera: ua.indexOf('opera') > -1 || ua.indexOf('opr') > -1,
				isFirefox: ua.indexOf('firefox') > -1 || ua.indexOf('fxios') > -1,
				isBaiduboxapp: ua.indexOf('baiduboxapp/') > -1,
				isBaidubrowser: ua.indexOf('baidubrowser/') > -1,
				isQihoobrowser: ua.indexOf('qihoobrowser/') > -1,
				isMxios: ua.indexOf('mxios/') > -1,
				isTimMobile: ua.indexOf('tim/') > -1,
				isHXApp: ua.indexOf('hxappversion') > -1 || ua.indexOf('hxapp') > -1,
				isWeiBo: ua.indexOf('weibo/') > -1
			},
			model: {
				isIphoneX: /iphone[\s\S]*os x/.test(ua) && device.browser.isiOS && screen.height === 812 && screen.width == 375,
				isHUAWEI: /huawei/.test(ua)
			}
		};
	device.browser.isSafari = device.os.isiOS && ua.indexOf("safari/") > -1 && !device.browser.isqqbrowser;
	device.browser.isIApp = device.os.isiOS && !device.browser.isSafari && !device.browser.isqqbrowser && !device.browser.isUC && !device.browser.isWechat && !device.browser.isSamsung && !device.browser.isSogou && !device.browser.isPinganWifi;
	$.device = $.extend({
		ua: ua
	}, device);
})(window, pTemplate);
