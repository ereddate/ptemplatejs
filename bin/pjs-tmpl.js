/*
 * grunt-tmpl
 * https://github.com/ereddate/grunt-tmpl
 *
 * Copyright (c) 2015 ereddate
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {

	'use strict';

	var _ = grunt.util._;
	var path = require('path'),
		tmpl = require('./pjs-htmltmpl').tmpl;

	grunt.registerMultiTask('tmpl', 'Include files and replace variables', function() {

		var options = this.options({
			prefix: '{{ ',
			suffix: ' }}',
			globals: {},
			includesDir: '',
			docroot: '.',
			encoding: 'utf-8'
		});

		grunt.log.debug('Options', options);

		// Preset default encofing as early as possible
		grunt.file.defaultEncoding = options.encoding;

		// Variables available in ALL files
		var globalVars = options.globals;

		// Names of our variables
		var globalVarNames = Object.keys(globalVars);

		globalVarNames.length > 0 && globalVarNames.forEach(function(globalVarName) {
			if (_.isString(globalVars[globalVarName])) {
				globalVars[globalVarName] = globalVars[globalVarName];
			} else {
				globalVars[globalVarName] = JSON.stringify(globalVars[globalVarName]);
			}
		});

		// Cached variable regular expressions
		var globalVarRegExps = {};

		function replace(contents, localVars) {

			localVars = localVars || {};

			var varNames = Object.keys(localVars);
			var varRegExps = {};

			// Replace local vars
			varNames.forEach(function(varName) {

				// Process lo-dash templates (for strings) in global variables and JSON.stringify the rest
				if (_.isString(localVars[varName])) {
					localVars[varName] = grunt.template.process(localVars[varName]);
				} else {
					localVars[varName] = JSON.stringify(localVars[varName]);
				}

				varRegExps[varName] = varRegExps[varName] || new RegExp(options.prefix + varName + options.suffix, 'g');

				contents = contents.replace(varRegExps[varName], localVars[varName]);
			});

			// Replace global variables
			globalVarNames.forEach(function(globalVarName) {

				globalVarRegExps[globalVarName] = globalVarRegExps[globalVarName] || new RegExp(options.prefix + globalVarName + options.suffix, 'g');

				contents = contents.replace(globalVarRegExps[globalVarName], globalVars[globalVarName]);
			});

			return contents;
		}

		var includeRegExp = new RegExp(options.prefix + 'include\\(\\s*["\'](.*?)["\'](,\\s*({[\\s\\S]*?})){0,1}\\s*\\)' + options.suffix);

		var localserver = require("../package.json");
		var tobase = require("./pjs-html2base64").to;

		function include(contents, workingDir, target) {

			var matches = includeRegExp.exec(contents);
			// Create a function that can be passed to String.replace as the second arg
			function createReplaceFn(replacement) {
				return function() {
					return replacement;
				};
			}

			function getIncludeContents(includePath, localVars, target) {
				var files = grunt.file.expand(includePath),
					includeContents = '';

				// If files is not an array of at least one element then bad
				if (!files.length) {
					grunt.log.error('Include file(s) not found', includePath);
					if (/\.[tmpl|html]/.test(includePath)) {
						grunt.file.write(includePath, "/* " + includePath + "\r\n " + grunt.template.today("yyyy-mm-dd") + " */");
						grunt.log.ok("Dynamically create a new file.");
						files.push(includePath);
					}
				}

				files.forEach(function(filePath, index) {
					//console.log(filePath)
					if (grunt.file.isFile(filePath)) {
						includeContents += grunt.file.read(filePath);
						// break a line for every file, except for the last one
						includeContents += index !== files.length - 1 ? '\n' : '';
						// Process includes
						includeContents = include(includeContents, path.dirname(filePath), target);
						if (options.processIncludeContents && typeof options.processIncludeContents === 'function') {
							includeContents = options.processIncludeContents(includeContents, localVars, filePath);
						}
					}
				});

				//console.log(includeContents)

				return includeContents;
			}

			while (matches) {

				var match = matches[0];
				var includePath = matches[1];
				var localVars = matches[3] ? JSON.parse(matches[3]) : {};

				if (/^[http|https|files]*\:\/\//.test(includePath)) {
					contents = contents.replace(match, includePath);
				} else {
					var reg = /\.[png|gif|jpg]+/.exec(includePath);
					if (reg) {
						var fs = require("fs");
						var img = fs.readFileSync(path.resolve(includePath.replace(/\s*\_base64/, "")));
						if (/\s*\_base64/.test(includePath)) {
							contents = contents.replace(match, "data:image/" + reg[0].replace(".", "") + ";base64," + img.toString("base64"));
						} else {
							contents = contents.replace(match, includePath);
						}
					} else {
						var localPath = includePath;
						includePath = includePath.replace(/\s*\_base64/, "");
						if (/\s*\_base64/.test(localPath) && !grunt.file.exists(path.resolve(includePath))) {
							contents = contents.replace(match, "data:text/html;base64," + tobase(includePath.replace(/\s*\_base64/, "")));
						} else {
							if (grunt.file.exists(path.resolve(includePath))) {
								if (!grunt.file.isPathAbsolute(includePath)) {
									includePath = path.resolve(path.join((options.includesDir ? options.includesDir : workingDir), includePath));
								} else {
									if (options.includesDir) {
										grunt.log.error('includesDir works only with relative paths. Could not apply includesDir to ' + includePath);
									}
									includePath = path.resolve(includePath);
								}

								var docroot = path.relative(path.dirname(includePath), path.resolve(options.docroot)).replace(/\\/g, '/');
								// Set docroot as local var but don't overwrite if the user has specified
								if (localVars.docroot === undefined) {
									localVars.docroot = docroot ? docroot + '/' : '';
								}

								if (grunt.file.exists(includePath)) {
									grunt.log.debug('Including', includePath);
								}

								grunt.log.debug('Locals', localVars);

								var includeContents = getIncludeContents(includePath, localVars, target);
								if (/\s*\_base64/.test(localPath)) {
									includeContents = "data:text/html;base64," + tobase(includeContents);
								}
								includeContents = tmpl(includeContents, localVars);
								contents = contents.replace(match, createReplaceFn(includeContents));
							} else {
								//console.log(includePath)
								grunt.file.write(includePath, "/* file no found. " + includePath + "\r\n " + grunt.template.today("yyyy-mm-dd") + " */");
								grunt.log.ok("Dynamically create a new file.");
								var includeContents = getIncludeContents(includePath, localVars, target);
								if (/\s*\_base64/.test(localPath)) {
									includeContents = "data:text/html;base64," + tobase(includeContents);
								}
								contents = contents.replace(match, createReplaceFn(includeContents));
							}
						}
					}
				}

				matches = includeRegExp.exec(contents);
			}

			return contents;
		}

		this.files.forEach(function(config) {

			config.src && config.src.forEach(function(src) {

				if (!grunt.file.isFile(src)) {
					return grunt.log.warn('Ignoring non file matching glob', src);
				}

				grunt.log.ok('Processing ' + src);

				// Read file
				var contents = grunt.file.read(src);

				var docroot = path.relative(path.dirname(src), path.resolve(options.docroot)).replace(/\\/g, '/');
				var localVars = {
					docroot: docroot ? docroot + '/' : ''
				};

				grunt.log.debug('Locals', localVars);

				// Make replacements
				contents = replace(contents, localVars);

				// Process includes
				var dir = path.dirname(src);
				//console.log(dir)
				contents = include(contents, dir, src);
				localserver.configs.server.autoreload && (contents = contents.replace("</body>", '<script src="//' + localserver.configs.server.ip + ':35729/livereload.js"></script></body>'));

				var dest = config.dest;

				if (isDirectory(dest) && !config.orig.cwd) {
					dest = path.join(dest, src);
				}

				grunt.log.debug('Saving to', dest);

				//console.log(contents)
				//var img2base64 = require("../../../views/modules/html2base64");
				//contents = img2base64(contents);

				contents = require('js-beautify').html(contents, {
					indent_size: 4,
					indent_char: " ",
					indent_with_tabs: false,
					preserve_newlines: false,
					max_preserve_newlines: 10,
					wrap_line_length: 0,
					indent_inner_html: false,
					brace_style: "collapse"
				});
				//console.log(tags)
				grunt.file.write(dest, contents);

				grunt.log.ok('Processed ' + src);
			});
		});
	});

	// Detect if destination path is a directory
	function isDirectory(dest) {
		return grunt.util._.endsWith(dest, '/');
	}
};