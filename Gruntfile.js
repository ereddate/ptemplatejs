module.exports = function(grunt) {

  grunt.registerTask("ptemplatejs-pjsBuild", "ptemplatejs-pjsBuild", function() {
    var app = require("./src/app");
    //console.log("->", app)
    app.configs.forEach(function(c) {
      var dirVer = c.modules.ver;
      c.modules.files.forEach(function(f) {
        var content = ["(function(win, $){/* time:" + (new Date()) + " */"];
        f.modules.forEach(function(m) {
          var l = m.split('.');
          if (l.length === 1) {
            app.template.modules[m] && content.push((app.template.modules[m].style || "") + (app.template.modules[m].template || "") + (app.template.modules[m].script || ""))
          } else {
            app.template.modules[l[0]] && app.template.modules[l[0]][l[1]] && content.push(app.template.modules[l[0]][l[1]]);
          }
        });
        content.push("})(this, pTemplate);")
        var file = app.template._config.configs.build.path + "js/" + dirVer + "/" + f.name + "." + f.ver + ".js";
        grunt.file.write(file, content.join(''));
        grunt.log.writeln('file ' + file + ' created.');
      })
    })
  });

  grunt.initConfig({
    watch: {
      pjs: {
        files: ["./**/*.pjs", "package.json", "./src/*.js"],
        tasks: ["ptemplatejs-pjsBuild"],
        options: {
          livereload: true
        }
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.registerTask('default', 'watch');
}