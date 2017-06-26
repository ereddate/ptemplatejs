module.exports = function(grunt) {
  var pkg = grunt.file.readJSON('package.json'),
    path = require("path"),
    _watch = {};
  var a = require("./bin/pjs-loader"),
    templates = a.getData();

  var app = require("./src/app"),
    gruntConfigs = {
      concat: {
        options: {
          noncmd: true
        }
      },
      uglify: {
        options: {
          report: "gzip"
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
    uglifyFiles = [],
    concats = [];

  var less = require("less");
  grunt.registerTask("lessToStyle", "lessToStyle", function(v) {
    for (var n in templates.modules) {
      var obj = templates.modules[n];
      obj.style && less.render(obj.style, function(e, output) {
        var text = output.css;
        text = "$.createStyle({" + text.replace(/\s+/gim, " ").replace(/([^{}]+){([^{}]+)+}/gim, function(a, b, c) {
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
        }) + "});"
        templates.modules[n].style = text;
      })
    }
    grunt.log.writeln('success.');
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
      dest: "./dist/" + c.projectName + "/libs/" + c.version + "/" + pkg.name + "." + c.version + ".js"
    });
    _watch[c.projectName] = {
      files: ["./src/" + c.projectName + "/**/*.pjs", "package.json", "./src/" + c.projectName + "/**/*.js", "./src/app.js", "gruntfile.js", "./src/" + c.projectName + "/**/*.html"],
      tasks: ["lessToStyle", "pjsbuild:" + c.projectName, "concat:" + c.projectName, "tmpl:" + c.projectName],
      options: {
        livereload: true
      }
    }
    gruntConfigs.tmpl[c.projectName] = {
      options: {
        encoding: "utf-8"
      },
      files: [{
        src: "*.html",
        dest: "dist/" + c.projectName + "/html/" + c.version + "/",
        expand: true,
        cwd: "src/" + c.projectName + "/html/"
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

    function readContent(r, projectName) {
      var content = ["/* " + projectName + "/" + grunt.template.today('yyyy-mm-dd hh:mm:ss') + " */'use strict';(function(win, $){"];
      r = r.replace(/{{\s*require\(['"]([^{}'"\(\)]+)['"]\)\s*}}/gim, function(a, b) {
        if (b) {
          b = b.split(' ');
          var g = [];
          b.forEach(function(m) {
            var l = m.split('.');
            if (l.length === 1) {
              templates.modules[m] && g.push((templates.modules[m].style || "") + (templates.modules[m].template || "") + (templates.modules[m].script || ""))
            } else {
              templates.modules[l[0]] && templates.modules[l[0]][l[1]] && g.push(templates.modules[l[0]][l[1]]);
            }
          });
          a = g.join('');
        }
        return a;
      });
      content.push(r);
      content.push("})(this, pTemplate);");
      return content;
    }
    app.configs.forEach(function(c) {
      var projectName = c.projectName;
      if (projectName == v) {
        var dirVer = c.version;
        if (c.modules && c.modules.files) {
          c.modules.files.forEach(function(f) {
            for (var n in f) {
              var r = grunt.file.read(path.resolve(f[n]));
              var content = readContent(r, projectName);
              var file = pkg.configs.build.path + projectName + "/js/" + dirVer + "/" + n + ".js";
              grunt.file.write(file, content.join(''));
              grunt.log.writeln('file ' + file + ' created.');
            }
          });
        } else {
          var files = grunt.file.expand("./src/" + v + "/js/*.js");
          files.forEach(function(f) {
            var r = grunt.file.read(path.resolve(f));
            var content = readContent(r, projectName);
            var file = f.replace("src/", pkg.configs.build.path).replace(v + "/js/", v + "/js/" + dirVer + "/");
            grunt.file.write(file, content.join(''));
            grunt.log.writeln('file ' + file + ' created.');
          })
        }
      }
    })
  });

  grunt.initConfig(gruntConfigs);

  var tmplpro = require("./bin/pjs-tmpl.js");
  tmplpro(grunt);

  grunt.loadNpmTasks("grunt-cmd-concat");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.registerTask('default', 'watch');
}