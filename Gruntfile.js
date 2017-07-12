module.exports = function(grunt) {
  var pkg = grunt.file.readJSON('package.json'),
    path = require("path"),
    basePath = pkg.configs.base,
    distPath = pkg.configs.build.path,
    _watch = {};
  var a = require("./bin/pjs-loader"),
    templates = {};

  var app = require("./" + basePath + "app"),
    gruntConfigs = {
      concat: {
        options: {
          noncmd: true
        }
      },
      tmpl: {
        options: {
          prefix: "{{ ",
          suffix: " }}",
          includesDir: "./"
        }
      },
      watch: _watch
    },
    concats = [];
  /*uglify: {
          options: {
            report: "gzip"
          }
        },*/
  grunt.registerTask("pjsloader", "pjs loader", function(v) {
    templates = a.getData(v);
  });

  var less = require("less");
  grunt.registerTask("lessToStyle", "lessToStyle", function(v) {
    var pconfig = {};
    var promise = function(next) {
      app.configs.forEach(function(a) {
        a.projectName == v && (pconfig = a, next(pconfig));
      })
    };
    promise(function(pconfig) {
      if ("projectName" in pconfig) {
        if (templates.modules) {
          for (var n in templates.modules) {
            var obj = templates.modules[n],
              imports = [],
              then = function(text) {
                text = text.replace(/\s+/gim, " ").replace(/\r+|\n+/gim, "").replace(/"/gim, "\\\"").replace(/'/gim, "\\\'");
                if (pconfig.build && pconfig.build.css && pconfig.build.css.isfile) {
                  text = text;
                } else {
                  text = "var head = $.query('head')[0]; head.appendChild($.createStyle(\"" + text + "\"));";
                }
                templates.modules[n].style = text;
              };
            if (obj.style && obj.style != "") {
               less.render(obj.style, function(e, output) {
                  if (e) {
                    console.log(e);
                  }
                  var text = output.css;
                  then(text);
                });
              /*obj.style = obj.style.replace(/\@import\s+['"]+([^'"]+)['"]+;/gim, function(a, b) {
                if (b) {
                  imports.push(b);
                }
                return "";
              });
              if (imports.length > 0) {
                console.log(imports)
                var parser = new(less.Parser)({
                  paths: imports
                });
                parser.parse(obj.style, function(e, tree) {
                  if (e) {
                    console.log(e);
                  }
                  var text = tree.toCSS({
                    compress: true
                  });
                  then(text);
                });
              } else {
                less.render(obj.style, function(e, output) {
                  if (e) {
                    console.log(e);
                  }
                  var text = output.css;
                  then(text);
                });
              }*/

            }
          }
          grunt.log.writeln('success.');
        } else {
          console.log("skip lessToStyle.1");
        }
      } else {
        console.log("skip lessToStyle.2");
      }
    });
  });

  grunt.registerTask("uglifyjs", "uglify javascript files", function(v) {
    require("./bin/pjs-uglifyjs").uglifyjs(v);
  });

  var libFiles = grunt.file.expand(pkg.configs.ptemplatejs.path + "*.js");

  app.configs.forEach(function(c) {
    var libConcats = [];
    libFiles.length > 0 && (libConcats.push(pkg.configs.ptemplatejs.path + pkg.name.replace("js", "") + ".js"), libFiles.forEach(function(f) {
      if (/\.extend\./.test(f) && !(new RegExp("\\.(" + pkg.configs.ptemplatejs.ignore.join('|') + ")\\.").test(f))) {
        libConcats.push(f)
      }
    }));
    libConcats.length > 0 && concats.push({
      src: libConcats,
      dest: "./" + distPath + c.projectName + "/libs/" + c.version + "/" + pkg.name + "." + c.version + ".js"
    });
    var tasks = ["pjsloader:" + c.projectName, "lessToStyle:" + c.projectName, "pjsbuild:" + c.projectName, "concat:" + c.projectName, "tmpl:" + c.projectName];
    if (c.build && c.build.uglifyjs === true) {
      tasks.push("uglifyjs:" + c.projectName);
    }
    _watch[c.projectName] = {
      files: ["./" + basePath + c.projectName + "/**/*.pjs", "package.json", "./" + basePath + c.projectName + "/**/*.js", "./" + basePath + "app.js", "gruntfile.js", "./" + basePath + c.projectName + "/**/*.html", "./" + basePath + c.projectName + "/**/*.less", "./" + basePath + c.projectName + "/**/*.css"],
      tasks: tasks,
      options: {
        livereload: (pkg.configs.server.autoreload || true)
      }
    };
    /*gruntConfigs.uglify[c.projectName] = {
      options: {
        banner: "\n/*! " + c.projectName + "/" + grunt.template.today("yyyy-mm-dd") + "end \*\/",
        mangle: true, //不混淆变量名
        preserveComments: false //删除注释，还可以为 false（删除全部注释），some（保留@preserve @license @cc_on等注释）
      },
      files: [{
        expand: true,
        cwd: 'dist/' + c.projectName + "/js/", //js目录下
        src: '**\/*.js', //所有js文件
        dest: 'dist/' + c.projectName + "/js/" //输出到此目录下
      }]
    };*/
    gruntConfigs.tmpl[c.projectName] = {
      options: {
        encoding: "utf-8"
      },
      files: [{
        src: "*.html",
        dest: distPath + c.projectName + "/html/" + c.version + "/",
        expand: true,
        cwd: basePath + c.projectName + "/html/"
      }]
    };
    gruntConfigs.concat[c.projectName] = {
      options: {
        footer: '\n/*! time:<%= grunt.template.today("yyyy-mm-dd") %> end \*\/',
        banner: '\n/*! ' + c.projectName + ' start\*\/'
      },
      files: concats
    };
  });

  grunt.registerTask("pjsbuild", "pjs build", function(v) {
    console.log("-> ", v)

    var js_beautify = require("js-beautify").js;
    var pconfig = {};
    app.configs.forEach(function(a) {
      a.projectName == v && (pconfig = a);
    });
    var isCssFile = ("projectName" in pconfig) && pconfig.build && pconfig.build.css && pconfig.build.css.isfile;
    //console.log(isCssFile)
    function readContent(r, projectName, file) {
      var content = ["/* " + projectName + "/" + grunt.template.today('yyyy-mm-dd hh:mm:ss') + " */'use strict';(function(win, $){"],
        h = [];
      r = r.replace(/{{\s*require\(['"]([^{}'"\(\)]+)['"]\)\s*}}/gim, function(a, b) {
        if (b) {
          b = b.split(' ');
          var g = [];
          b.forEach(function(m) {
            var l = m.split('.');
            if (l.length === 1) {
              templates.modules[m] && (!isCssFile ? g.push((templates.modules[m].style || "") + (templates.modules[m].template || "") + (templates.modules[m].script || "")) : (h.push(templates.modules[m].style || ""), g.push((templates.modules[m].template || "") + (templates.modules[m].script || ""))));
            } else {
              if (templates.modules[l[0]] && templates.modules[l[0]][l[1]]) {
                if (l[1] == "style" && !isCssFile || l[1] != "style") {
                  g.push(templates.modules[l[0]][l[1]]);
                } else {
                  h.push(templates.modules[l[0]][l[1]]);
                }
              }
            }
          });
          a = g.join('');
        }
        return a;
      });
      content.push(r);
      content.push("})(this, pTemplate);");
      if (h.length > 0) {
        grunt.file.write(file.replace(/\/js\//gim, "/css/").replace(/\.js/gim, ".css"), h.join(''));
      }
      return content;
    }

    function savefile(file, content) {
      content = js_beautify(content, {
        indent_size: 4,
        indent_char: " ",
        indent_with_tabs: false,
        preserve_newlines: false,
        max_preserve_newlines: 10,
        wrap_line_length: 0,
        indent_inner_html: false,
        brace_style: "collapse"
      });
      grunt.file.write(file, content);
      grunt.log.writeln('file ' + file + ' created.');
    }
    app.configs.forEach(function(c) {
      var projectName = c.projectName;
      if (projectName == v) {
        var dirVer = c.version;
        if (c.modules && c.modules.files) {
          c.modules.files.forEach(function(f) {
            for (var n in f) {
              var r = grunt.file.read(path.resolve(f[n]));
              var file = pkg.configs.build.path + projectName + "/js/" + dirVer + "/" + n + ".js";
              var content = readContent(r, projectName, file);
              savefile(file, content.join(''));
            }
          });
        } else {
          var files = grunt.file.expand("./" + basePath + v + "/js/*.js");
          files.forEach(function(f) {
            var r = grunt.file.read(path.resolve(f));
            var file = f.replace(basePath, pkg.configs.build.path).replace(v + "/js/", v + "/js/" + dirVer + "/");
            var content = readContent(r, projectName, file);
            savefile(file, content.join(''));
          })
        }
      }
    })
  });

  var tmplpro = require("./bin/pjs-tmpl.js");
  tmplpro(grunt);

  grunt.initConfig(gruntConfigs);

  //grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-cmd-concat");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.registerTask('default', 'watch');
}