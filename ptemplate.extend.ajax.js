/*!
 * ptemplatejs v1.0.0
 * @author yandong
 *
 * https://github.com/ereddate/ptemplatejs
 */
 'use strict';
typeof window.pTemplate != "undefined" && (function(win, $) {
	var document = window.document,
		key,
		name,
		jsonType = 'application/json',
		htmlType = 'text/html',
		blankRE = /^\s*$/

	function ajaxSuccess(data, xhr, settings) {
		var context = settings.context,
			status = 'success'
		settings.success && settings.success(status, data, xhr)
	}

	function ajaxError(error, type, xhr, settings) {
		var context = settings.context
		settings.error && settings.error(type, error, xhr)
	}

	function empty() {}
	let ajaxSettings = {
		type: 'GET',
		success: empty,
		error: empty,
		context: null,
		global: true,
		xhr: function() {
			return new window.XMLHttpRequest()
		},
		accepts: {
			json: jsonType,
			html: htmlType,
			text: 'text/plain'
		},
		timeout: 3000,
		processData: true,
		cache: true
	}

	function mimeToDataType(mime) {
		if (mime) mime = mime.split(';', 2)[0]
		return mime && (mime == htmlType ? 'html' :
			mime == jsonType ? 'json' : 'text')
	}

	function appendQuery(url, query) {
		if (query == '') return url
		return (url + '&' + query).replace(/[&?]{1,2}/, '?')
	}

	function serializeData(options) {
		if (options.processData && options.data && typeof options.data != "string")
			options.data = $.__mod__.serialize(options.data, options.traditional)
		if (options.data && (!options.type || options.type.toUpperCase() == 'GET'))
			options.url = appendQuery(options.url, options.data), options.data = undefined
	}
	var ajax = function(options) {
		var settings = $.extend({}, options || {})
		for (let key in ajaxSettings)
			if (settings[key] === undefined) settings[key] = ajaxSettings[key]
		if (!settings.url) settings.url = window.location.toString()
		serializeData(settings)
		if (settings.cache === false) settings.url = appendQuery(settings.url, '_=' + Date.now())
		var dataType = settings.dataType
		var mime = ajaxSettings.accepts[dataType],
			headers = {},
			setHeader = function(name, value) {
				name && (headers[name.toLowerCase()] = [name, value])
			},
			protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
			xhr = ajaxSettings.xhr()
		setHeader('X-Requested-With', 'XMLHttpRequest')
		setHeader('Accept', mime || '*/*')
		if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET'))
			setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded')
		if (settings.headers)
			for (name in settings.headers) setHeader(name, settings.headers[name])
		xhr.setRequestHeader = setHeader
		var nativeSetHeader = xhr.setRequestHeader,
			abortTimeout;
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				xhr.onreadystatechange = empty
				clearTimeout(abortTimeout)
				var result, error = false
				if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
					dataType = dataType || mimeToDataType(settings.mimeType || xhr.getResponseHeader('content-type'))
					result = xhr.responseText
					try {
						if (dataType == 'json') result = blankRE.test(result) ? null : new Function("return " + result)();
					} catch (e) {
						error = e
					}
					if (error) ajaxError(error, 'parsererror', xhr, settings)
					else ajaxSuccess(result, xhr, settings)
				} else {
					ajaxError(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, settings)
				}
			}
		}
		if (settings.xhrFields)
			for (let name in settings.xhrFields) xhr[name] = settings.xhrFields[name]
		var async = 'async' in settings ? settings.async : true
		xhr.open(settings.type, settings.url, async, settings.username, settings.password)
		for (let name in headers) {
			nativeSetHeader.apply(xhr, headers[name]);
		}
		if (settings.timeout > 0) abortTimeout = setTimeout(function() {
			xhr.onreadystatechange = empty
			xhr.abort()
			ajaxError(null, 'timeout', xhr, settings)
		}, settings.timeout)
		xhr.send(settings.data ? settings.data : null)
		return {
			error() {}
		}
	}
	$.each(["get", "post"], (i, name) => {
		$[name] = (url, data, success, error, type, options) => {
			if (typeof error == "string") {
				options = type;
				type = error;
				error = undefined;
			}
			ajax(!options ? {
				url: url,
				type: name,
				dataType: type,
				data: data,
				success: (type, data, xhr) => {
					success && success(type, data, xhr)
				},
				error: (type, msg, xhr) => {
					error && error(type, data, xhr)
				}
			} : $.extend({
				url: url,
				type: name,
				dataType: type,
				data: data,
				success: (data, xhr) => {
					success && success(type, data, xhr)
				},
				error: (type, msg, xhr) => {
					error && error(type, data, xhr)
				}
			}, options))
			return $;
		}
	});
	var escape = encodeURIComponent

	function serialize(params, obj, traditional, scope) {
		var type, array = $.is("array", obj),
			hash = $.isPlainObject(obj)
		$.each(obj, function(key, value) {
			type = typeof value;
			if (scope) key = traditional ? scope :
				scope + '[' + (hash || type == 'object' || type == 'array' ? key : '') + ']'
			if (!scope && array) params.add(value.name, value.value)
			else if (type == "array" || (!traditional && type == "object"))
				serialize(params, value, traditional, key)
			else params.add(key, value)
		})
	}
	$.__mod__.serialize = function(obj, traditional) {
		var params = []
		params.add = function(k, v) {
			this.push(escape(k) + '=' + escape(v))
		}
		serialize(params, obj, traditional)
		return params.join('&').replace(/%20/g, '')
	}
})(this, pTemplate);