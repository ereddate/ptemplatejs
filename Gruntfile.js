module.exports = function(grunt) {
  var pkg = grunt.file.readJSON('package.json'),
    _watch = {};
  var app = require("./src/app");
  app.configs.forEach(function(c) {
    _watch[c.projectName] = {
      files: ["./src/" + c.projectName + "/**/*.pjs", "package.json", "./src/" + c.projectName + "/**/*.js", "./src/app.js", "gruntfile.js"],
      tasks: ["ptemplatejs-pjsBuild:" + c.projectName],
      options: {
        livereload: true
      }
    }
  });
  grunt.registerTask("ptemplatejs-pjsBuild", "ptemplatejs-pjsBuild", function(v) {
    console.log("-> ", v)
    app.configs.forEach(function(c) {
      var projectName = c.projectName;
      if (projectName == v) {
        var dirVer = c.modules.ver;
        c.modules.files.forEach(function(f) {
          var content = ["'use strict';(function(win, $){/* " + projectName + "/" + grunt.template.today('yyyy-mm-dd hh:mm:ss') + " */"];
          f.modules.forEach(function(m) {
            var l = m.split('.');
            if (l.length === 1) {
              app.template.modules[m] && content.push((app.template.modules[m].style || "") + (app.template.modules[m].template || "") + (app.template.modules[m].script || ""))
            } else {
              app.template.modules[l[0]] && app.template.modules[l[0]][l[1]] && content.push(app.template.modules[l[0]][l[1]]);
            }
          });
          content.push("})(this, pTemplate);");
          var file = pkg.configs.build.path + "js/" + projectName + "/" + dirVer + "/" + f.name + "." + f.ver + ".js";
          grunt.file.write(file, content.join(''));
          grunt.log.writeln('file ' + file + ' created.');
        });
      }
    })
  });

  grunt.initConfig({
    watch: _watch
  });

  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.registerTask('default', 'watch');
}