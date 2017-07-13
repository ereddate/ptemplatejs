$.setBaseFontSize(16);
var callbacks = $.Callbacks();

{{ require("common adinclude loading dialog router.script header login reg footer nav list dialogheader") }}
{{ require("comment_list comment_input comment usinfo share article_author article teacheader teacher follow recommend gotop download") }}
{{ require("main") }}

callbacks.done();