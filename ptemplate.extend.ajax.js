/*!
 * ptemplatejs v1.0.0
 * @author yandong
 *
 * https://github.com/ereddate/ptemplatejs
 */
'use strict';
typeof window.pTemplate != "undefined" && (function(win, $) {

	var jsonpID = 0,
		document = window.document,
		key,
		name,
		rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
		scriptTypeRE = /^(?:text|application)\/javascript/i,
		xmlTypeRE = /^(?:text|application)\/xml/i,
		jsonType = 'application/json',
		htmlType = 'text/html',
		blankRE = /^\s*$/,
		originAnchor = document.createElement('a')

	originAnchor.href = window.location.href

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
	$.ajaxSettings = {
		// Default type of request
		type: 'GET',
		// Callback that is executed before request
		beforeSend: empty,
		// Callback that is executed if the request succeeds
		success: empty,
		// Callback that is executed the the server drops error
		error: empty,
		// Callback that is executed on request complete (both: error and success)
		complete: empty,
		// The context for the callbacks
		context: null,
		// Whether to trigger "global" Ajax events
		global: true,
		// Transport
		xhr: function() {
			return new window.XMLHttpRequest()
		},
		// MIME types mapping
		// IIS returns Javascript as "application/x-javascript"
		accepts: {
			script: 'text/javascript, application/javascript, application/x-javascript',
			json: jsonType,
			xml: 'application/xml, text/xml',
			html: htmlType,
			text: 'text/plain'
		},
		// Whether the request is to another domain
		crossDomain: false,
		// Default timeout
		timeout: 0,
		// Whether data should be serialized to string
		processData: true,
		// Whether the browser should be allowed to cache GET responses
		cache: true
	}

	function mimeToDataType(mime) {
		if (mime) mime = mime.split(';', 2)[0]
		return mime && (mime == htmlType ? 'html' :
			mime == jsonType ? 'json' :
			scriptTypeRE.test(mime) ? 'script' :
			xmlTypeRE.test(mime) && 'xml') || 'text'
	}

	function appendQuery(url, query) {
		if (query == '') return url
		return (url + '&' + query).replace(/[&?]{1,2}/, '?')
	}

	// serialize payload and append it to the URL for GET requests
	function serializeData(options) {
		if (options.processData && options.data && typeof options.data != "string")
			options.data = $.param(options.data, options.traditional)
		if (options.data && (!options.type || options.type.toUpperCase() == 'GET'))
			options.url = appendQuery(options.url, options.data), options.data = undefined
	}


	$.ajax = function(options) {
		var settings = $.extend({}, options || {}),
			urlAnchor
		for (key in $.ajaxSettings)
			if (settings[key] === undefined) settings[key] = $.ajaxSettings[key]

		if (!settings.crossDomain) {
			urlAnchor = document.createElement('a')
			urlAnchor.href = settings.url
			urlAnchor.href = urlAnchor.href
			settings.crossDomain = (originAnchor.protocol + '//' + originAnchor.host) !== (urlAnchor.protocol + '//' + urlAnchor.host)
		}

		if (!settings.url) settings.url = window.location.toString()
		serializeData(settings)

		var dataType = settings.dataType,
			hasPlaceholder = /\?.+=\?/.test(settings.url)
		if (hasPlaceholder) dataType = 'jsonp'

		if (settings.cache === false || (
				(!options || options.cache !== true) &&
				('script' == dataType || 'jsonp' == dataType)
			))
			settings.url = appendQuery(settings.url, '_=' + Date.now())

		var mime = settings.accepts[dataType],
			headers = {},
			setHeader = function(name, value) {
				headers[name.toLowerCase()] = [name, value]
			},
			protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
			xhr = settings.xhr(),
			nativeSetHeader = xhr.setRequestHeader,
			abortTimeout

		if (!settings.crossDomain) setHeader('X-Requested-With', 'XMLHttpRequest')
		setHeader('Accept', mime || '*/*')
		if (mime = settings.mimeType || mime) {
			if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0]
			xhr.overrideMimeType && xhr.overrideMimeType(mime)
		}
		if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET'))
			setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded')

		if (settings.headers)
			for (name in settings.headers) setHeader(name, settings.headers[name])
		xhr.setRequestHeader = setHeader

		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				xhr.onreadystatechange = empty
				clearTimeout(abortTimeout)
				var result, error = false
				if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
					dataType = dataType || mimeToDataType(settings.mimeType || xhr.getResponseHeader('content-type'))
					result = xhr.responseText

					try {
						// http://perfectionkills.com/global-eval-what-are-the-options/
						if (dataType == 'script')(1, eval)(result)
						else if (dataType == 'xml') result = xhr.responseXML
						else if (dataType == 'json') result = blankRE.test(result) ? null : JSON.parse(result)
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
			for (name in settings.xhrFields) xhr[name] = settings.xhrFields[name]

		var async = 'async' in settings ? settings.async : true
		xhr.open(settings.type, settings.url, async, settings.username, settings.password)

		for (name in headers) nativeSetHeader.apply(xhr, headers[name])

		if (settings.timeout > 0) abortTimeout = setTimeout(function() {
			xhr.onreadystatechange = empty
			xhr.abort()
			ajaxError(null, 'timeout', xhr, settings)
		}, settings.timeout)

		// avoid sending empty string (#319)
		xhr.send(settings.data ? settings.data : null)
		return xhr
	}

	// handle optional data/success arguments
	function parseArguments(url, data, success, error, dataType, options) {
		if (typeof data === "function") dataType = success, success = data, data = undefined
		return $.extend({
			url: url,
			data: data,
			success: success,
			error: error,
			dataType: dataType
		}, options);
	}

	$.get = function( /* url, data, success, error, dataType */ ) {
		return $.ajax(parseArguments.apply(null, arguments))
	}

	$.post = function( /* url, data, success, error, dataType */ ) {
		var options = parseArguments.apply(null, arguments)
		options.type = 'POST'
		return $.ajax(options)
	}

	$.getJSON = function( /* url, data, success, error */ ) {
		var options = parseArguments.apply(null, arguments)
		options.dataType = 'json'
		return $.ajax(options)
	}

	var escape = encodeURIComponent

	function serialize(params, obj, traditional, scope) {
		var type, array = $.__mod__.isArray(obj),
			hash = $.__mod__.isPlainObject(obj)
		$.each(obj, function(key, value) {
			type = typeof value;
			if (value) {
				if (scope) key = traditional ? scope :
					scope + '[' + (hash || type == 'object' || type == 'array' ? key : '') + ']'
				if (!scope && array) params.add(value.name, value.value)
				else if (type == "array" || (!traditional && type == "object"))
					serialize(params, value, traditional, key)
				else params.add(key, value)
			} else {
				params.add(key, value)
			}
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

	$.param = function(obj, traditional) {
		var params = []
		params.add = function(key, value) {
			if (typeof value === "function") value = value()
			if (value == null) value = ""
			this.push(escape(key) + '=' + escape(value))
		}
		serialize(params, obj, traditional)
		return params.join('&').replace(/%20/g, '+')
	}
})(window, pTemplate);