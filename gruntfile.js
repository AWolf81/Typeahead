// Gruntfile.js

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    dirs: {
        output: 'dist', // path to build folder
    },
    concat: {
        js: {
            src: 'src/components/typeahead/*.js',
            dest: '<%=dirs.output %>/<%= pkg.name %>.js'
        }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: '<%=dirs.output %>/<%= pkg.name %>.js',
        dest: '<%=dirs.output %>/<%= pkg.name %>.min.js'
      }
    },
    ngAnnotate: {
        options: {
            remove: true, // removes $inject from source (if any)
            add: true,  // adds $inject to source
            singleQuotes: true
        },
        app: {
            files: {
                '<%=dirs.output %>/<%= pkg.name %>.js': '<%=dirs.output %>/<%= pkg.name %>.js'
            }
            /*files: [
                {
                    expand: true,
                    src: ['build/<%= pkg.name %>.js'],
                    ext: '.annotated.js', // Dest filepaths will have this extension.
                    extDot: 'last',       // Extensions in filenames begin after the last dot
                },
            ],*/
        }
    }
  });

  // Load the plugin that provides the "concat" task.
  grunt.loadNpmTasks('grunt-contrib-concat');

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  
  // load the plugin that provides the "ng-annotate" task.
  grunt.loadNpmTasks('grunt-ng-annotate');

  // Default task(s).
  // grunt.registerTask('default', ['uglify']);
  grunt.registerTask('build', ['concat', 'ngAnnotate', 'uglify']);

};