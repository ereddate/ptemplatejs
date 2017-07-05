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

  grunt.registerTask("pjsloader", "pjs loader", function(v) {
    templates = a.getData(v);
  });

  var less = require("less");
  grunt.registerTask("lessToStyle", "lessToStyle", function(v) {
    if (templates.modules) {
      for (var n in templates.modules) {
        var obj = templates.modules[n];
        obj.style && less.render(obj.style, function(e, output) {
          var text = output.css;
          text = "var head = $.query('head')[0]; head.appendChild($.createStyle(\"" + text.replace(/\s+/gim, " ").replace(/\r+|\n+/gim, "").replace(/"/gim, "\\\"").replace(/'/gim, "\\\'") + "\"));"
          templates.modules[n].style = text;
        })
      }
      grunt.log.writeln('success.');
    } else {
      console.log("skip lessToStyle.");
    }
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
    _watch[c.projectName] = {
      files: ["./" + basePath + c.projectName + "/**/*.pjs", "package.json", "./" + basePath + c.projectName + "/**/*.js", "./" + basePath + "app.js", "gruntfile.js", "./" + basePath + c.projectName + "/**/*.html"],
      tasks: ["pjsloader:" + c.projectName, "lessToStyle", "pjsbuild:" + c.projectName, "concat:" + c.projectName, "tmpl:" + c.projectName],
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

    function savefile(file, content) {
      grunt.file.write(file, js_beautify(content, {
        indent_size: 4,
        indent_char: " ",
        indent_with_tabs: false,
        preserve_newlines: false,
        max_preserve_newlines: 10,
        wrap_line_length: 0,
        indent_inner_html: false,
        brace_style: "collapse"
      }));
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
              var content = readContent(r, projectName);
              var file = pkg.configs.build.path + projectName + "/js/" + dirVer + "/" + n + ".js";
              savefile(file, content.join(''));
            }
          });
        } else {
          var files = grunt.file.expand("./" + basePath + v + "/js/*.js");
          files.forEach(function(f) {
            var r = grunt.file.read(path.resolve(f));
            var content = readContent(r, projectName);
            var file = f.replace(basePath, pkg.configs.build.path).replace(v + "/js/", v + "/js/" + dirVer + "/");
            savefile(file, content.join(''));
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