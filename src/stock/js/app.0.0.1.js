var doc = win.document,
	body = doc.body || doc.documentElement;
$.setBaseFontSize(16);

import {get, set} from "common.script";

var ua = get.ua();
if (ua.device.os.isPC){
	$.query("#systip")[0]._addClass("active");
	return;
}

var type = get.getURLKeyValue(location.href, "type");
var app_type = type || "web";
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
}else{
	callbacks.add(function(next){
		var urls = $.createDom("docmentfragment",{});
		for (var i=0;i<5;i++) {
			urls._append($.createDom("link", {
				href: location.href.split('?')[0]+"?channel="+(i+1),
				rel: "prefetch",
			}));
		}
		$.query("head")[0]._append(urls);
		next();
	});
}

var time = get.time,
	cookie = get.cookie,
	getData = get.getData,
	isSignIn = get.isSignIn,
	cid = get.getcid();

var signIn = isSignIn();
console.log(signIn);

var q = get.getURLKeyValue(location.href, "channel"),
	g = get.getURLKeyValue(location.href, "grail_type"),
	teachid = get.getURLKeyValue(location.href, "id"),
	teachurl = get.getURLKeyValue(location.href, "url"),
	starchannel = get.getURLKeyValue(location.href, "star");
console.log(q);

import "common.style store";
import "common_router.script news_router.script market_router.script star_router.script search_router.script famousman_router.script";
import "header footer gotop loading dialog";
import "main";
import "track";