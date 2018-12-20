  module.exports = function(grunt) {
    var options = require('minimist')(process.argv.slice(2), {});
    var pkg = grunt.file.readJSON('package.json'),
      path = require("path"),
      basePath = pkg.configs.base,
      distPath = pkg.configs.build.path,
      _watch = {};
    var a = require("./bin/pjs-loader"),
      x = require("./bin/pjsx-build"),
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
        copy: {},
        babel: {
          options: {
            sourceMap: false,
            presets: ['babel-preset-es2015']
          }
        },
        ftp_push: {
          options: {
            host: "",
            port: 21,
            username: "",
            password: "",
            dest: pkg.configs.ftpbase || "/"
          }
        }
      },
      concats = [];

    var _date = function(d, pattern) {
      d = d ? new Date(d) : new Date();
      pattern = pattern || 'yyyyMMddhhmmss';
      var y = d.getFullYear().toString(),
        o = {
          M: d.getMonth() + 1,
          d: d.getDate(),
          h: d.getHours(),
          m: d.getMinutes(),
          s: d.getSeconds()
        };
      pattern = pattern.replace(/(y+)/ig, function(a, b) {
        return y.substr(4 - Math.min(4, b.length));
      });
      for (var i in o) {
        pattern = pattern.replace(new RegExp('(' + i + '+)', 'g'), function(a, b) {
          return (o[i] < 10 && b.length > 1) ? '0' + o[i] : o[i];
        });
      }
      return pattern;
    };

    var timeDir = options.d || _date();
    console.log("-------- /" + timeDir + "/");
    app.configs.forEach(function(a) {
      gruntConfigs.zip[a.projectName] = {
        expand: true,
        src: [
          distPath + a.projectName + "/css/" + a.version + "/**/*.css",
          distPath + a.projectName + "/imgs/*.{jpg,png,gif}",
          distPath + a.projectName + "/html/" + a.version + "/**/*.html",
          distPath + a.projectName + "/js/" + a.version + "/**/*.js",
          distPath + a.projectName + "/libs/" + a.version + "/**/*.js"
        ],
        dest: distPath + a.projectName + "/zip/" + a.projectName.replace("/", "_") + "." + a.version + "." + grunt.template.today('yyyymmddhhmmss') + ".zip"
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
      gruntConfigs.copy[a.projectName] = {
        files: [{
          expand: true,
          cwd: basePath + a.projectName + '/img/',
          dest: distPath + a.projectName + '/img/',
          src: "**/*.{png,jpg,gif}"
        }]
      };
    });

    grunt.registerTask("pjsloader", "pjs loader", function(v) {
      templates = a.getData(v);
    });

    var less = require("less"),
      cleanCSS = require('clean-css');
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
                    text = "var head = $.query('head')[0], styledom = document.getElementById(\"" + obj.name + "\"), newstyle = $.createStyle(\"" + text.replace(/"/gim, "\\\"").replace(/'/gim, "\\\'") + "\"," + (obj.name ? "\"" + obj.name + "\"" : "") + "); if (!styledom){head.appendChild(newstyle);}";
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
                  text = (new cleanCSS({}).minify(text)).styles; //cleanCSS.process(text);
                  //console.log(text);
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
      var tasks = ["pjsloader:" + c.projectName, "lessToStyle:" + c.projectName, "pjsbuild:" + c.projectName, "concat:" + c.projectName, "tmpl:" + c.projectName, "copy:" + c.projectName];
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

      gruntConfigs.ftp_push[c.projectName + "_dev"] = {
        files: [{
          expand: true,
          cwd: distPath + c.projectName + '/js/',
          dest: "/test/" + c.projectName + '/' + timeDir + '/js/',
          src: "**/*.js"
        }, {
          expand: true,
          cwd: distPath + c.projectName + '/libs/',
          dest: "/test/" + c.projectName + '/' + timeDir + '/libs/',
          src: "**/*.js"
        }, {
          expand: true,
          cwd: distPath + c.projectName + '/css/',
          dest: "/test/" + c.projectName + '/' + timeDir + '/css/',
          src: "**/*.css"
        }, {
          expand: true,
          cwd: distPath + c.projectName + '/img/',
          dest: "/mhd/" + c.projectName + '/img/',
          src: "**/*.{png,jpg,gif}"
        }]
      };
      gruntConfigs.ftp_push[c.projectName + "_app"] = {
        files: [{
          expand: true,
          cwd: distPath + c.projectName + '/js/',
          dest: "/mhd/" + c.projectName + '/' + timeDir + '/js/',
          src: "**/*.js"
        }, {
          expand: true,
          cwd: distPath + c.projectName + '/libs/',
          dest: "/mhd/" + c.projectName + '/' + timeDir + '/libs/',
          src: "**/*.js"
        }, {
          expand: true,
          cwd: distPath + c.projectName + '/css/',
          dest: "/mhd/" + c.projectName + '/' + timeDir + '/css/',
          src: "**/*.css"
        }, {
          expand: true,
          cwd: distPath + c.projectName + '/img/',
          dest: "/mhd/" + c.projectName + '/img/',
          src: "**/*.{png,jpg,gif}"
        }]
      };

      if (c.ftp) {
        tasks.push("ftp_push:" + c.projectName + "_dev");
        grunt.registerTask('build_' + c.projectName + "_dev", tasks);
        var newTask = [];
        for (var i = 0; i < tasks.length; i++) newTask.push(tasks[i]);
        newTask.splice(newTask.indexOf("ftp_push:" + c.projectName + "_dev"), 1, "ftp_push:" + c.projectName + "_app")
        grunt.registerTask('build_' + c.projectName + "_app", newTask);
      } else {
        grunt.registerTask('build_' + c.projectName, tasks);
      }
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

      function readContent(r, projectName, file, app, bool) {
        var content = [];
        r = r.replace(/{{\s*require\(['"]([^{}'"\(\)]+)['"]\)\s*}}|import\s*(.+)\s*from\s*['"]([^'"]+)['"]|import\s*['"]([^'"]+)['"]/gim, function(a, b, c, d, e) {
          //console.log(a, b, c, d, e)
          if (b) {
            b = b.split(' ');
            var g = [];
            b.forEach(function(m) {
              var l = m.split('.');
              if (l.length === 1) {
                templates.modules[m] && (!isCssFile ? g.push((templates.modules[m].style || "") + (templates.modules[m].template || "") + (app.build.parsePJSX ? (templates.modules[m].script && x.parsePJSX(templates.modules[m].script) || "") : (templates.modules[m].script || ""))) : (h.push(templates.modules[m].style || ""), g.push((templates.modules[m].template || "") + (app.build.parsePJSX ? (templates.modules[m].script && x.parsePJSX(templates.modules[m].script) || "") : (templates.modules[m].script|| "")))));
              } else {
                if (templates.modules[l[0]] && templates.modules[l[0]][l[1]]) {
                  if (l[1] == "style" && !isCssFile || l[1] != "style") {
                    g.push(templates.modules[l[0]][l[1]]);
                  } else {
                    h.push(app.build.parsePJSX && l[1] === "script" ? x.parsePJSX(templates.modules[l[0]][l[1]]) : templates.modules[l[0]][l[1]]);
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
              //console.log("239: ---", m)
              m = m.split('.');
              c && g.push("var __" + m[0] + "_l = {exports:{}}; function __" + m[0] + "(exports){");
              if (!pconfig.uglifyjs) {
                g.push("/* " + m.join('.') + " start */");
              }
              if (m.length === 1) {
                templates.modules[m[0]] && (!isCssFile ? g.push((templates.modules[m[0]].style || "") + (templates.modules[m[0]].template || "") + (app.build.parsePJSX ? (templates.modules[m[0]].script && x.parsePJSX(templates.modules[m[0]].script) || "") : (templates.modules[m[0]].script || ""))) : (h.push(templates.modules[m[0]].style || ""), g.push((templates.modules[m[0]].template || "") + (app.build.parsePJSX ? (templates.modules[m[0]].script && x.parsePJSX(templates.modules[m[0]].script) || "") : (templates.modules[m[0]].script || "")))));
              } else {
                if (templates.modules[m[0]] && templates.modules[m[0]][m[1]]) {
                  if (m[1] == "style" && !isCssFile || m[1] != "style") {
                    g.push(templates.modules[m[0]][m[1]]);
                  } else {
                    h.push(app.build.parsePJSX && m[1] === "script" ? x.parsePJSX(templates.modules[m[0]][m[1]]) : templates.modules[m[0]][m[1]]);
                  }
                }
              }
              c && g.push("}\r\n__" + m[0] + "(__" + m[0] + "_l.exports);var " + c + " = __" + m[0] + "_l.exports");
              if (!pconfig.uglifyjs) {
                g.push("/* " + m.join('.') + " end */");
              }
            });
            for (var i = 0; i < g.length; i++) g[i] = readContent(g[i], projectName, file, app, true).join('');
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
                c.build.parsePJSX && (r = x.parsePJSX(r));
                var content = readContent(r, projectName, file, c);
                content.splice(0, 0, ((!pconfig.uglifyjs ? "/* " + projectName + "/" + grunt.template.today('yyyy-mm-dd hh:mm:ss') + " */" : "") + "'use strict';(function(win, " + (pkg.configs.ptemplatejs.alias || "$") + "){"));
                content.push("})(window, typeof pTemplate !== 'undefined' && pTemplate || {});");
                savefile(file, content.join(''));
              }
            });
          } else {
            var files = grunt.file.expand("./" + basePath + v + "/js/**/*.js");
            files.forEach(function(f) {
              var r = grunt.file.read(path.resolve(f));
              var file = f.replace(basePath, pkg.configs.build.path).replace(v + "/js/", v + "/js/" + dirVer + "/");
              h = [];
              c.build.parsePJSX && (r = x.parsePJSX(r));
              var content = readContent(r, projectName, file, c);
              content.splice(0, 0, ((!pconfig.uglifyjs ? "/* " + projectName + "/" + grunt.template.today('yyyy-mm-dd hh:mm:ss') + " */" : "") + "'use strict';(function(win, " + (pkg.configs.ptemplatejs.alias || "$") + "){"));
              content.push("})(window, typeof pTemplate !== 'undefined' && pTemplate || {});");
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
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-ftp-push");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.registerTask('default', 'watch');

  }