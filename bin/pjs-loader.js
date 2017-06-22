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
              objName = file.replace(path + filepath.replace(/\*\*\//gim, ""), "").replace("." + ext, ""),
              tagName = "",
              b = new htmlparser.Parser({
                onopentag: function(name, attr) {
                  tagName = name;
                  if (/template|script|style/.test(name)) {
                    isWrite = true;
                    if (Reflect.has(attr, 'p-template')) {
                      objName = attr["p-template"];
                      tags[name] = {
                        name: objName
                      }
                    }

                  } else {
                    html.push("<" + name + " " + (typeof attr != "undefined" && !isEmptyObject(attr) && toArray(attr) || "") + ">")
                  }
                },
                ontext: function(text) {
                  if (isWrite) {
                    //console.log(tagName, text)
                    if (typeof text != "undefined" && /style/.test(tagName)) {
                      text = "pTemplate.createStyle({" + text.replace(/\s+/gim, " ").replace(/([^{}]+){([^{}]+)+}/gim, function(a, b, c) {
                        //console.log(a, b, c)
                        var d = [];
                        if (b) {
                          b = b.split(/,\s*/);
                          b.forEach(function(n) {
                            var f = [];
                            c.split(/;\s*/).forEach(function(e) {
                              var g = e.split(/\:\s*/);
                              if (/-/.test(g[0])) {
                                var h = g[0].split('-');
                                g[0] = h[0] + h[1][0].toUpperCase() + h[1].substr(1, h[1].length);
                              }
                              f.push("'" + g[0] + "':'" + g[1] + "'")
                            })
                            d.push("'" + n.replace(/^\s+/gim, "") + "':{" + f.join(f.length > 1 ? ',' : "") + "},")
                          });
                          a = d.join('')
                        }
                        return a;
                      }) + "});";
                      //console.log("->", text)
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
                      tags[name] = "pTemplate.createTemplate('" + tags[name].name + "', {parent: undefined,content: \"" + html.join('') + "\",data: {}}, true);";
                    } else {
                      tags[name] = html.join('');
                    }
                    html.length = 0;
                  } else {
                    html.push("</" + name + ">")
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
        //console.log(contents)
        grunt.log.writeln('pjs file loaded.');
      });
    }
    return {
      modules: contents,
      _config: pkg
    };
  }
};