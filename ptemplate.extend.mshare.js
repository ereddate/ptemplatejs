/*!
 * ptemplatejs v1.0.0
 * @author yandong
 *
 * https://github.com/ereddate/ptemplatejs

 	//DEMO
	var a = $.mShare([{
		appId: '',  //app id
		wximgUrl: '',  //图片地址
		wxnoncestr: (new Date()).getTime(),
		wxtitle: '',  //标题
		wxdescContent: '',  //内容
		ticket:{
			api: '',  //获取ticket的接口，支持jsonp请求，返回callback=wxonload
			timeout: 3000  //请求超时时间
		},
		success: function(){
			//分享成功后
		},
		fail: function(){
			//分享失败后
		}
	}]);
	//微信分享
	a.ticket('weixin');
	//QQ分享
	a.ticket('qq');
 */
'use strict';
typeof window.pTemplate != "undefined" && (function(win, $) {
	var mShare = function(options) {
		return new mShare.fn.init(options);
	};
	mShare.fn = mShare.prototype = {
		init: function(options) {
			mShare.extend(mShare, options);
			return this;
		},
		ticket: function(type) {
			var then = this;
			switch (type) {
				case "weixin":
					$.jsonp(mShare.ticket.api || "", {}, {
						timeout: mShare.ticket.timeout || 10000,
						callbackName: "pTemplate.mShare.wxonload"
					}).done(function(str) {
						console.log(str)
					}, function(err) {
						console.log(err)
					});
					break;
				case "public":
					jQuery("head").append(jQuery('<script src="//qzonestyle.gtimg.cn/qzone/qzact/common/share/share.js"></script>').on("load error", function() {
						var ajaxurl = "//wapi.hexun.com/Api_getTicket.cc?t=" + mShare.wxnoncestr + "&callback=pTemplate.mShare.publiconload";
						jQuery.ajax({
							dataType: "jsonp",
							type: "get",
							url: ajaxurl,
							success: function(str) {}
						});
					}));
					break;
				default:
					if (typeof mqq === "undefined") {
						jQuery("head").append(jQuery('<script src="//open.mobile.qq.com/sdk/qqapi.js?_bid=152"></script>').on("load error", function() {
							mShare.mqqload();
						}));
					} else {
						mShare.mqqload();
					}
					break;
			}
			return this;
		}
	};
	mShare.fn.init.prototype = mShare.fn;
	mShare.extend = function(a, b) {
		a = a || {};
		for (var i in b) a[i] = b[i];
		return a;
	}
	mShare.extend(mShare, {
		wximgUrl: "",
		wxnoncestr: "ptemplatejs",
		wxtitle: "ptemplatejs",
		wxdescContent: "ptemplatejs",
		signature: function(msg) {
			/**
			 *
			 *  (SHA1)
			 *
			 **/
			function rotate_left(n, s) {
				var t4 = (n << s) | (n >>> (32 - s));
				return t4;
			};

			function lsb_hex(val) {
				var str = "";
				var i;
				var vh;
				var vl;

				for (i = 0; i <= 6; i += 2) {
					vh = (val >>> (i * 4 + 4)) & 0x0f;
					vl = (val >>> (i * 4)) & 0x0f;
					str += vh.toString(16) + vl.toString(16);
				}
				return str;
			};

			function cvt_hex(val) {
				var str = "";
				var i;
				var v;

				for (i = 7; i >= 0; i--) {
					v = (val >>> (i * 4)) & 0x0f;
					str += v.toString(16);
				}
				return str;
			};


			function Utf8Encode(string) {
				string = string.replace(/\r\n/g, "\n");
				var utftext = "";

				for (var n = 0; n < string.length; n++) {

					var c = string.charCodeAt(n);

					if (c < 128) {
						utftext += String.fromCharCode(c);
					} else if ((c > 127) && (c < 2048)) {
						utftext += String.fromCharCode((c >> 6) | 192);
						utftext += String.fromCharCode((c & 63) | 128);
					} else {
						utftext += String.fromCharCode((c >> 12) | 224);
						utftext += String.fromCharCode(((c >> 6) & 63) | 128);
						utftext += String.fromCharCode((c & 63) | 128);
					}

				}

				return utftext;
			};

			var blockstart;
			var i, j;
			var W = new Array(80);
			var H0 = 0x67452301;
			var H1 = 0xEFCDAB89;
			var H2 = 0x98BADCFE;
			var H3 = 0x10325476;
			var H4 = 0xC3D2E1F0;
			var A, B, C, D, E;
			var temp;

			msg = Utf8Encode(msg);

			var msg_len = msg.length;

			var word_array = new Array();
			for (i = 0; i < msg_len - 3; i += 4) {
				j = msg.charCodeAt(i) << 24 | msg.charCodeAt(i + 1) << 16 |
					msg.charCodeAt(i + 2) << 8 | msg.charCodeAt(i + 3);
				word_array.push(j);
			}

			switch (msg_len % 4) {
				case 0:
					i = 0x080000000;
					break;
				case 1:
					i = msg.charCodeAt(msg_len - 1) << 24 | 0x0800000;
					break;

				case 2:
					i = msg.charCodeAt(msg_len - 2) << 24 | msg.charCodeAt(msg_len - 1) << 16 | 0x08000;
					break;

				case 3:
					i = msg.charCodeAt(msg_len - 3) << 24 | msg.charCodeAt(msg_len - 2) << 16 | msg.charCodeAt(msg_len - 1) << 8 | 0x80;
					break;
			}

			word_array.push(i);

			while ((word_array.length % 16) != 14) word_array.push(0);

			word_array.push(msg_len >>> 29);
			word_array.push((msg_len << 3) & 0x0ffffffff);


			for (blockstart = 0; blockstart < word_array.length; blockstart += 16) {

				for (i = 0; i < 16; i++) W[i] = word_array[blockstart + i];
				for (i = 16; i <= 79; i++) W[i] = rotate_left(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);

				A = H0;
				B = H1;
				C = H2;
				D = H3;
				E = H4;

				for (i = 0; i <= 19; i++) {
					temp = (rotate_left(A, 5) + ((B & C) | (~B & D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
					E = D;
					D = C;
					C = rotate_left(B, 30);
					B = A;
					A = temp;
				}

				for (i = 20; i <= 39; i++) {
					temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
					E = D;
					D = C;
					C = rotate_left(B, 30);
					B = A;
					A = temp;
				}

				for (i = 40; i <= 59; i++) {
					temp = (rotate_left(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
					E = D;
					D = C;
					C = rotate_left(B, 30);
					B = A;
					A = temp;
				}

				for (i = 60; i <= 79; i++) {
					temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
					E = D;
					D = C;
					C = rotate_left(B, 30);
					B = A;
					A = temp;
				}

				H0 = (H0 + A) & 0x0ffffffff;
				H1 = (H1 + B) & 0x0ffffffff;
				H2 = (H2 + C) & 0x0ffffffff;
				H3 = (H3 + D) & 0x0ffffffff;
				H4 = (H4 + E) & 0x0ffffffff;

			}

			var temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);

			return temp.toLowerCase();
		},
		publiconload: function(str) {
			//注册
			var self = this;
			var wxdate = new Date();
			var wxtimestamp = wxdate.getFullYear() + wxdate.getMonth() + wxdate.getDate() + wxdate.getTime();
			var wxLink = location.href;
			var wxticket = str.ticket;
			//console.log("jsapi_ticket=" + wxticket + "&noncestr=" + self.wxnoncestr + "&timestamp=" + wxtimestamp + "&url=" + wxLink)
			var wxsignature = mShare.signature("jsapi_ticket=" + wxticket + "&noncestr=hexun" + self.wxnoncestr + "&timestamp=" + wxtimestamp + "&url=" + wxLink);
			setShareInfo({
				title: self.wxtitle, // 分享标题
				summary: self.wxdescContent, // 分享内容
				pic: self.wximgUrl, // 分享图片
				url: wxLink, // 分享链接
				// 微信权限验证配置信息，若不在微信传播，可忽略
				WXconfig: {
					swapTitleInWX: true, // 是否标题内容互换（仅朋友圈，因朋友圈内只显示标题）
					appId: 'wxaa529a3e82b2c5b2', // 公众号的唯一标识
					timestamp: wxtimestamp, // 生成签名的时间戳
					nonceStr: "hexun" + self.wxnoncestr, // 生成签名的随机串
					signature: wxsignature // 签名
				}
			});
		},
		mqqload: function() {
			var self = this;
			if (typeof mqq !== "undefined") {
				/*mqq.invoke("share", "toQQ", {
					imgUrl: self.wximgUrl,
					title: "[TITLE]" + self.wxtitle,
					desc: "[DESC]" + self.wxdescContent,
					link: location.href
				}, function(evt) {
					self.success && self.success(evt);
				});
				mqq.invoke("share", "toQz", {
					imgUrl: self.wximgUrl,
					title: "[TITLE]" + self.wxtitle,
					desc: "[DESC]" + self.wxdescContent,
					link: location.href
				}, function(evt) {
					self.success && self.success(evt);
				});
				mqq.invoke("share", "toWX", {
					imgUrl: self.wximgUrl,
					title: "[TITLE]" + self.wxtitle,
					desc: "[DESC]" + self.wxdescContent,
					link: location.href,
					type: '',
					dataUrl: ''
				}, function(evt) {
					self.success && self.success(evt);
				});
				mqq.invoke("share", "toTL", {
					imgUrl: self.wximgUrl,
					title: "[TITLE]" + self.wxtitle,
					desc: "[DESC]" + self.wxdescContent,
					link: location.href
				}, function(evt) {
					self.success && self.success(evt);
				});
				mqq.invoke('nextradio', 'share', {
					url: location.href,
					title: self.wxtitle,
					summary: self.wxdescContent,
					cover: '',
					extraSummary: self.wxdescContent,
					suffixSummary: self.wxdescContent,
					shareType: 2,
					dataUrl: ''
				}, function(o) {
					self.success && self.success(evt);
				});*/
				mqq.invoke("share", "setShare", {
					type: "share",
					image: [self.wximgUrl],
					title: [self.wxtitle],
					summary: [self.wxdescContent],
					shareURL: [location.href]
				}, function(evt) {
					
				});
			}
		},
		wxonload: function(str) {
			var self = this;
			var success = self.success,
				error = self.fail;
			var wxdate = new Date();
			var wxtimestamp = wxdate.getFullYear() + wxdate.getMonth() + wxdate.getDate() + wxdate.getTime();
			var wxLink = location.href;
			var wxticket = str.ticket;
			var wxsignature = mShare.signature("jsapi_ticket=" + wxticket + "&noncestr=" + self.wxnoncestr + "&timestamp=" + wxtimestamp + "&url=" + wxLink);
			wx.config({
				debug: false, 
				appId: self.appId || '',
				timestamp: wxtimestamp,
				nonceStr: self.wxnoncestr,
				signature: wxsignature,
				jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo']
			});
			wx.ready(function() {
				wx.onMenuShareTimeline({
					title: self.wxtitle,
					link: wxLink, 
					imgUrl: self.wximgUrl,
					success: function() {
						success && success();
					},
					cancel: function() {
						error && error();
					}
				});
				wx.onMenuShareAppMessage({
					title: self.wxtitle,
					desc: self.wxdescContent,
					link: wxLink,
					imgUrl: self.wximgUrl,
					type: 'link',
					dataUrl: '',
					success: function() {
						success && success();
					},
					cancel: function() {
						error && error();
					}
				});
				wx.onMenuShareQQ({
					title: self.wxtitle, 
					desc: self.wxdescContent,
					link: wxLink,
					imgUrl: self.wximgUrl,
					success: function() {
						success && success();
					},
					cancel: function() {
						error && error();
					}
				});
				wx.onMenuShareWeibo({
					title: self.wxtitle,
					desc: self.wxdescContent, 
					link: wxLink,
					imgUrl: self.wximgUrl,
					success: function() {
						success && success();
					},
					cancel: function() {
						error && error();
					}
				});
			});
		}
	});

	$.mShare = mShare;
})(window, pTemplate);