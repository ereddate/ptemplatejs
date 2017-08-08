$.setBaseFontSize(16);
var callbacks = $.Callbacks();

import "dplus.script store.script";

console.log("->get, ", common_store.get("project"));
common_store.commit({
	github: "//github.com/ereddate/pTemplatejs"
}, "添加demo的在线源码地址");
console.log("->showlog, ", common_store.showlog());
common_store.revert(0);
console.log("->revert 0, ", common_store.get());

import {api, apiB} from "api";
console.log(api, apiB);

import "common adinclude loading dialog router.script shoprouter.script follow gotop dialogheader touchmenu";
import "comment usinfo article teacher";
import "main";

callbacks.done();