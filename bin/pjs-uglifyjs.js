var fs = require("fs"),
  grunt = require('grunt'),
  grunt_path = require("path");

module.exports = {
  uglifyjs: function(v) {
    var pkg = grunt.file.readJSON('package.json'),
      paths = ["/js/**/*.js", "/libs/**/*.js"],
      count = 0;
    paths.forEach(function(p) {
      files = grunt.file.expand(pkg.configs.build.path + v + p);
      console.log(files)
      if (files.length > 0) {
        files.forEach(function(f) {
          var content = grunt.file.read(f);
          content = content.replace(/[\r\n\t\s]+/gim, " ").replace(new RegExp("'use strict';", "gim"), "'use strict';\r\n").replace(/\/\*/gim, "\r\n/*");
          //console.log(content);
          grunt.file.write(f, content);
        });
      }
      count += files.length
    });
    grunt.log.writeln('uglify ' + count + ' file.');
  }
};