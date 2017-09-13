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
      watch: _watch,
      zip: {},
      uglify: {
        options: {
          report: "gzip"
        }
      },
      babel: {
        options: {
          sourceMap: true,
          presets: ['babel-preset-es2015']
        }
      }
    },
    concats = [];
  app.configs.forEach(function(a) {
    gruntConfigs.zip[a.projectName] = {
      expand: true,
      src: [
        "dist/" + a.projectName + "/css/" + a.version + "/**/*.css",
        "dist/" + a.projectName + "/imgs/*.{jpg,png,gif}",
        "dist/" + a.projectName + "/html/" + a.version + "/**/*.html",
        "dist/" + a.projectName + "/js/" + a.version + "/**/*.js",
        "dist/" + a.projectName + "/libs/" + a.version + "/**/*.js"
      ],
      dest: "dist/" + a.projectName + "/zip/" + a.projectName.replace("/", "_") + "." + a.version + "." + grunt.template.today('yyyymmddhhmmss') + ".zip"
    };
    gruntConfigs.babel[a.projectName] = {
      files: [{
        src: "**/*.js",
        dest: distPath + a.projectName + "/js/" + a.version + "/",
        expand: true,
        cwd: distPath + a.projectName + "/js/" + a.version + "/"
      }, {
        src: "**/*.js",
        dest: distPath + a.projectName + "/libs/" + a.version + "/",
        expand: true,
        cwd: distPath + a.projectName + "/libs/" + a.version + "/"
      }]
    };
    gruntConfigs.tmpl[a.projectName] = {
      options: {
        encoding: "utf-8"
      },
      files: [{
        src: "**/*.html",
        dest: distPath + a.projectName + "/html/" + a.version + "/",
        expand: true,
        cwd: basePath + a.projectName + "/html/"
      }, {
        src: "**/*.css",
        dest: distPath + a.projectName + "/css/" + a.version + "/",
        expand: true,
        cwd: distPath + a.projectName + "/css/" + a.version + "/"
      }]
    };
  })

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
                text = text.replace(/\s+/gim, " ").replace(/\r+|\n+/gim, "");
                if (pconfig.build && pconfig.build.css && pconfig.build.css.isfile) {
                  text = text;
                } else {
                  text = "var head = $.query('head')[0]; head.appendChild($.createStyle(\"" + text.replace(/"/gim, "\\\"").replace(/'/gim, "\\\'") + "\"));";
                }
                templates.modules[n].style = text;
              };
            if (obj.style && obj.style != "") {
              //then(obj.style);
              less.render(obj.style, function(e, output) {
                if (e) {
                  console.log(e);
                }
                var text = output.css;
                then(text);
              });
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

  var libFiles = grunt.file.expand(pkg.configs.ptemplatejs.path + "*.js");

  app.configs.forEach(function(c) {
    var libConcats = [];
    libFiles.length > 0 && (libConcats.push(pkg.configs.ptemplatejs.path + pkg.name.replace("js", "") + ".js"), libFiles.forEach(function(f) {
      if (/\.extend\./.test(f) && !(new RegExp("\\.(" + (c.ptemplatejs && c.ptemplatejs.ignore || []).join('|') + ")\\.").test(f))) {
        libConcats.push(f)
      }
    }));
    libConcats.length > 0 && concats.push({
      src: libConcats,
      dest: "./" + distPath + c.projectName + "/libs/" + c.version + "/" + pkg.name + "." + c.version + ".js"
    });
    gruntConfigs.concat[c.projectName] = {
      options: {
        footer: '\n/*! time:<%= grunt.template.today("yyyy-mm-dd") %> end \*\/',
        banner: '\n/*! ' + c.projectName + ' start\*\/'
      },
      files: concats
    };
    var tasks = ["pjsloader:" + c.projectName, "lessToStyle:" + c.projectName, "pjsbuild:" + c.projectName, "concat:" + c.projectName, "tmpl:" + c.projectName];
    tasks.push("babel:" + c.projectName);
    if (c.build && c.build.uglifyjs === true) {
      tasks.push("uglify:" + c.projectName);
    }
    tasks.push("zip:" + c.projectName);
    _watch[c.projectName] = {
      files: ["./" + basePath + c.projectName + "/**/*.pjs", "package.json", "./" + basePath + c.projectName + "/**/*.js", "./" + basePath + "app.js", "gruntfile.js", "./" + basePath + c.projectName + "/**/*.html", "./" + basePath + c.projectName + "/**/*.less", "./" + basePath + c.projectName + "/**/*.css"],
      tasks: tasks,
      options: {
        livereload: (pkg.configs.server.autoreload || true),
        event: ["all"],
        nospawn: true,
        spawn: false
      }
    };
    gruntConfigs.uglify[c.projectName] = {
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
      }, {
        expand: true,
        cwd: 'dist/' + c.projectName + "/libs/", //js目录下
        src: '**\/*.js', //所有js文件
        dest: 'dist/' + c.projectName + "/libs/" //输出到此目录下
      }]
    };
    grunt.registerTask('build_'+c.projectName, tasks);
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

    var h = [];

    function readContent(r, projectName, file, bool) {
      var content = [];
      r = r.replace(/{{\s*require\(['"]([^{}'"\(\)]+)['"]\)\s*}}|import\s*(.+)\s*from\s*['"]([^'"]+)['"]|import\s*['"]([^'"]+)['"]/gim, function(a, b, c, d, e) {
        //console.log(a, b, c, d, e)
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
        } else if (d || e) {
          //console.log(a, c, d, e)
          var g = [],
            f = d || e;
          f.split(' ').forEach(function(m) {
            // console.log("206", m)
            m = m.split('.');
            c && g.push("var __" + m[0] + "_l = {exports:{}}; function __" + m[0] + "(exports){");
            if (!pconfig.uglifyjs) {
              g.push("/* " + m.join('.') + " start */");
            }
            if (m.length === 1) {
              templates.modules[m[0]] && (!isCssFile ? g.push((templates.modules[m[0]].style || "") + (templates.modules[m[0]].template || "") + (templates.modules[m[0]].script || "")) : (h.push(templates.modules[m[0]].style || ""), g.push((templates.modules[m[0]].template || "") + (templates.modules[m[0]].script || ""))));
            } else {
              if (templates.modules[m[0]] && templates.modules[m[0]][m[1]]) {
                if (m[1] == "style" && !isCssFile || m[1] != "style") {
                  g.push(templates.modules[m[0]][m[1]]);
                } else {
                  h.push(templates.modules[m[0]][m[1]]);
                }
              }
            }
            c && g.push("}\r\n__" + m[0] + "(__" + m[0] + "_l.exports);var " + c + " = __" + m[0] + "_l.exports");
            if (!pconfig.uglifyjs) {
              g.push("/* " + m.join('.') + " end */");
            }
          });
          for (var i = 0; i < g.length; i++) g[i] = readContent(g[i], projectName, file, true).join('');
          a = g.join('');
        }
        return a;
      });
      content.push(r.replace(/;;/gim, ";"));
      //content.push("})(this, pTemplate);");
      if (h.length > 0 && bool != true) {
        /* console.log(file.replace(/\/js\//gim, "/css/").replace(/\.js/gim, ".less"))
         var reg = /(.+\/)([^\/]+\.less)/.exec(file.replace(/\/js\//gim, "/css/").replace(/\.js/gim, ".less"));
         console.log(reg)*/
        grunt.file.write(file.replace(/\/js\//gim, "/css/").replace(/\.js/gim, ".css"), h.join(''));
        /*var parser = new (less.Parser)({
          paths:[reg[1]],
          filename: reg[2]
        });
        parser.parse(h.join(''), function(e, tree){
          tree.toCSS({
            compress: true
          })
        });*/
      }
      return content;
    }

    function savefile(file, content) {
      //console.log(file)
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
              var file = pkg.configs.build.path + projectName + "/js/" + dirVer + "/**/" + n + ".js";
              h = [];
              var content = readContent(r, projectName, file);
              content.splice(0, 0, ((!pconfig.uglifyjs ? "/* " + projectName + "/" + grunt.template.today('yyyy-mm-dd hh:mm:ss') + " */" : "") + "'use strict';(function(win, " + (pkg.configs.ptemplatejs.alias || "$") + "){"));
              content.push("})(window, pTemplate);");
              savefile(file, content.join(''));
            }
          });
        } else {
          var files = grunt.file.expand("./" + basePath + v + "/js/**/*.js");
          files.forEach(function(f) {
            var r = grunt.file.read(path.resolve(f));
            var file = f.replace(basePath, pkg.configs.build.path).replace(v + "/js/", v + "/js/" + dirVer + "/");
            h = [];
            var content = readContent(r, projectName, file);
            content.splice(0, 0, ((!pconfig.uglifyjs ? "/* " + projectName + "/" + grunt.template.today('yyyy-mm-dd hh:mm:ss') + " */" : "") + "'use strict';(function(win, " + (pkg.configs.ptemplatejs.alias || "$") + "){"));
            content.push("})(window, pTemplate);");
            savefile(file, content.join(''));
          })
        }
      }
    })
  });

  var tmplpro = require("./bin/pjs-tmpl.js");
  tmplpro(grunt);

  grunt.initConfig(gruntConfigs);

  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-zip");
  grunt.loadNpmTasks("grunt-babel");
  grunt.loadNpmTasks("grunt-cmd-concat");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.registerTask('default', 'watch');
}