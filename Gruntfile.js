module.exports = function(grunt) {

  grunt.registerTask("ptemplatejs-pjsBuild", "ptemplatejs-pjsBuild", function() {
    var app = require("./src/app");
    //console.log("->", app)
    app.configs.forEach(function(c) {
      var dirVer = c.modules.ver;
      c.modules.files.forEach(function(f) {
        var content = [];
        f.modules.forEach(function(m) {
          app.template.modules[m] && content.push((app.template.modules[m].style||"") + (app.template.modules[m].template||"") + (app.template.modules[m].script||""))
        });
        var file = app.template._config.configs.build.path + "js/" + dirVer + "/" + f.name + "." + f.ver + ".js";
        grunt.file.write(file, content.join(''));
        grunt.log.writeln('file ' + file + ' created.');
      })
    })
  });

  grunt.initConfig({
    watch: {
      pjs: {
        files: ["./**/*.pjs", "package.json"],
        tasks: ["ptemplatejs-pjsBuild"]
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.registerTask('default', 'watch');
}