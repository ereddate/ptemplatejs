/*!
 * ptemplatejs v1.0.0
 * @author yandong
 *
 * https://github.com/ereddate/ptemplatejs

	$.ABTest('appkey').setFlagFn('clickItem', {
		a: function(track){
			track();
			...
		},
		b: function(track){
			track();
			...
		},
		...
	}, function(flags){
		...
			flags();
		...
	}, function(){
		...
	});

 */
'use strict';
typeof window.pTemplate != "undefined" && (function(win, $) {

	$.ABTest = function(appkey) {
		$.use("https://sdk.appadhoc.com/ab.plus.js", () => {
			adhoc('init', {
 			  appKey: appkey
 			});
		});
		return {
			setFlagFn(name, options, adhocCallback, noAdhocCallback){
				if (typeof adhoc != "undefined") {
					adhoc('getFlags', function(flags) {
						var val = flags.get(name);
						adhocCallback && adhocCallback(function() {
							options[val] && options[val](function() {
								typeof adhoc != 'undefined' && adhoc('track', name, 1);
							});
						});
					});
				} else {
					noAdhocCallback && noAdhocCallback();
				}
			}
		}
	};

})(window, window.pTemplate);