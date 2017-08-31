$.setBaseFontSize(16);

import {get, set} from "common.script";

var type = get.getURLKeyValue(location.href, "type");
var app_type = type || "web";
/*var ua = get.ua();
if (ua.device.os.isAndroid && (ua.device.browser.isUC || ua.device.browser.isqqbrowser || ua.device.browser.isSogou || ua.device.browser.isbaidubrowser)){
	var a = document.getElementById("systip");
	a.className = a.className.replace(/\s*active/gim, "");
	a.className+=" active";
	return;
}*/
import "face";

var callbacks = new $.Callbacks();
if (app_type != "web") {
	callbacks.add(function(next) {
		var b = 3;
		var face = $.render("my-face", {
			content: "pTemplateJs Demo",
			ad: "#",
			adurl: "#",
			adtitle: "ad",
			num: b
		}, $.createDom("div", {}), function(e) {
			$.query(".face")[0] && $.query(".face")[0]._remove();
			$.query("body")[0]._append(e.children[0]);
		});
		face.interval = setInterval(function() {
			b -= 1;
			if (b <= 0) {
				face.interval && clearInterval(face.interval);
				$.query(".face")[0] && $.query(".face")[0]._remove();
				return;
			}
			$.update("my-face", {
				num: b
			});
		}, 1000);
		next();
	});
}

var time = get.time,
	cookie = get.cookie,
	getData = get.getData,
	isSignIn = get.isSignIn;

var signIn = isSignIn();
console.log(signIn);

var q = get.getURLKeyValue(location.href, "channel"),
	teachid = get.getURLKeyValue(location.href, "id"),
	teachurl = get.getURLKeyValue(location.href, "url");
console.log(q);

$.extend($.__mod__.tmplThesaurus, {
	toTime: function(val, filterCondition){
		return set.time(val);
	}
});

import "common.style router.script store header footer gotop loading dialog banner";
import "main";
import "dplus";