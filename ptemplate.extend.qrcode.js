/*!
 * ptemplatejs v1.0.0
 * @author yandong
 *
 * https://github.com/ereddate/ptemplatejs
 */
'use strict';
typeof window.pTemplate != "undefined" && (function(win, $) {
	$.qrcode = function(selector, options) {
		// if options is string, 
		if (typeof options === 'string') {
			options = {
				text: options
			};
		}

		// set default values
		// typeNumber < 1 for automatic calculation
		options = $.extend({
			render: "canvas",
			width: 256,
			height: 256,
			typeNumber: -1,
			correctLevel: win.QRErrorCorrectLevel.H,
			background: "#ffffff",
			foreground: "#000000"
		}, options);

		console.log(options);

		var createCanvas = function(image) {
			// create the qrcode itself
			var qrcode = new QRCode(options.typeNumber, options.correctLevel);
			qrcode.addData(options.text);
			qrcode.make();

			// create canvas element
			var canvas = document.createElement('canvas');
			canvas.width = options.width;
			canvas.height = options.height;
			var ctx = canvas.getContext('2d');

			// compute tileW/tileH based on options.width/options.height
			var tileW = options.width / qrcode.getModuleCount();
			var tileH = options.height / qrcode.getModuleCount();

			// draw in the canvas
			for (var row = 0; row < qrcode.getModuleCount(); row++) {
				for (var col = 0; col < qrcode.getModuleCount(); col++) {
					ctx.fillStyle = qrcode.isDark(row, col) ? options.foreground : options.background;
					var w = (Math.ceil((col + 1) * tileW) - Math.floor(col * tileW));
					var h = (Math.ceil((row + 1) * tileW) - Math.floor(row * tileW));
					ctx.fillRect(Math.round(col * tileW), Math.round(row * tileH), w, h);
				}
			}
			// return just built canvas
			image.src = canvas.toDataURL("image/png");
			return image;
		}

		// from Jon-Carlos Rivera (https://github.com/imbcmdth)
		var createTable = function() {
			// create the qrcode itself
			var qrcode = new QRCode(options.typeNumber, options.correctLevel);
			qrcode.addData(options.text);
			qrcode.make();

			// create table element
			var $table = $.createDom("table", {})
				._css("width", options.width + "px")
				._css("height", options.height + "px")
				._css("border", "0px")
				._css("border-collapse", "collapse")
				._css('background-color', options.background);

			// compute tileS percentage
			var tileW = options.width / qrcode.getModuleCount();
			var tileH = options.height / qrcode.getModuleCount();

			// draw in the table
			for (var row = 0; row < qrcode.getModuleCount(); row++) {
				var $row = $.createDom('tr', {})._css('height', tileH + "px")._appendTo($table);

				for (var col = 0; col < qrcode.getModuleCount(); col++) {
					$.createDom('td',{})
						._css('width', tileW + "px")
						._css('background-color', qrcode.isDark(row, col) ? options.foreground : options.background)
						._appendTo($row);
				}
			}
			// return just built canvas
			return $table;
		}
		var img = $.createDom("img",{});

		var element = options.render == "canvas" ? createCanvas(img) : createTable(),
			parent = $.query(selector);
		return parent && parent[0] && $.query(element)[0]._appendTo(parent[0]);
	};
})(window, window.pTemplate);