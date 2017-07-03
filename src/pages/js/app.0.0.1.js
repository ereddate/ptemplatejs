$.setBaseFontSize(16);
var callbacks = $.Callbacks();

{{ require("router.script main header footer nav page") }}

callbacks.done();