var fs = require("fs"),
  grunt = require('grunt'),
  htmlparser = require('htmlparser2'),
  grunt_path = require("path"),
  isEmptyObject = function(obj) {
    var name;
    for (var name in obj) {
      return false;
    }
    return true;
  },
  toArray = function(json) {
    var html = [];
    for (var name in json) {
      html.push(name + "=\\\"" + (json[name]).replace(/\|/gim, "\\\|") + "\\\"");
    }
    return html.join(' ');
  };

module.exports = {
  getData: function() {
    var pkg = grunt.file.readJSON('package.json'),
      contents = {};
    if (pkg && pkg.configs) {
      pkg.configs.requirePjs.forEach(function(f) {
        var src = f.src,
          dest = f.dest,
          path = f.path || "./",
          ext = f.ext;
        src.forEach(function(filepath) {
          var a = grunt.file.expand(path + filepath + "*." + ext);
          //console.log("->", a)
          a.length > 0 && a.forEach(function(file) {
            var result = grunt.file.read(file);
            var isWrite = false,
              tags = {
                template: "",
                script: "",
                style: ""
              },
              html = [],
              objName = /\/([^\.\/]+)\.(\d\.)*[a-zA-Z]+$/.exec(file)[1] || file,
              tagName = "",
              b = new htmlparser.Parser({
                onopentag: function(name, attr) {
                  tagName = name;
                  if (/template|script|style/.test(name)) {
                    isWrite = true;
                    if (Reflect.has(attr, 'p-template')) {
                      tags[name] = {
                        name: attr["p-template"]
                      }
                    }

                  } else {
                    html.push("<" + name + " " + (typeof attr != "undefined" && !isEmptyObject(attr) && toArray(attr) || "") + ">")
                  }
                },
                ontext: function(text) {
                  if (isWrite) {
                    if (typeof text != "undefined" && /style/.test(tagName)) {
                      html.push(text);
                    } else if (typeof text != "undefined") {
                      html.push(text.replace(/[\r\n\t]+/gim, ""));
                    }
                  }
                },
                onclosetag: function(name, attr) {
                  if (/template|script|style/.test(name)) {
                    isWrite = false;
                    if (/template/.test(name)) {
                      tags[name] = "$.createTemplate('" + tags[name].name + "', {parent: undefined,content: \"" + html.join('') + "\",data: {}}, true);";
                    } else {
                      tags[name] = html.join('');
                    }
                    html.length = 0;
                  } else {
                    !/br/.test(name) && html.push("</" + name + ">")
                  }
                  tagName = "";
                },
                onerror: function(error) {
                  grunt.log.error('error. ' + error);
                }
              });
            b.write(result);
            b.end();
            contents[objName] = tags;
          });
        });
        grunt.log.writeln('pjs file loaded.');
      });
    }
    return {
      modules: contents,
      _config: pkg
    };
  }
};