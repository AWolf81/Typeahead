// Gruntfile.js

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    dirs: {
        output: 'dist', // path to build folder
    },

    connect: {
      server: {
        options: {
          port: 8000,
          hostname: 'localhost',
        }
      }
    },

    watch: {
      livereload: {
        options: {
          spawn: false,
          livereload: true,
        },
        files: ['*.html', 'src/**/*.js', 'src/**/*.tmpl', 'src/**/*.html', 'css/**/*.scss', '!lib/dontwatch.js'],
        tasks: ['jshint', 'build:dev'] //['default'],
      },
    },
    jshint: {
      options: {
        jshintrc: true,
      },
      all: ['gruntfile.js', 'src/**/*.js', 'test/**/*.js']
    },
    concat: {
        js: {
            src: [
              'src/common/**/*.js', // common scripts (utils and shared methods)
              'src/components/typeahead/*.module.js', // modules first
              'src/components/typeahead/*.js',

              'src/components/**/*.js', // load other source files (order doesn't matter)
              '<%=angularTemplateCache.newModule.dest %>'
            ],
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
    },
    angularTemplateCache: {
      options: {
        module: '<%= pkg.name %>.tpls'
      },
      newModule: {
        options: {
          newModule: true,
        },
        src: '**/*.tmpl',// 'src/components/typeahead/**/*.tmpl'],
        dest: 'tmp/<%= pkg.name %>.tpls.js',
        cwd: 'src/components/typeahead' // path prefix for src
      },
    }
  });

  // Load the plugin that provides the "concat" task.
  grunt.loadNpmTasks('grunt-contrib-concat');

  // Load the plugin that provides the "watch" task.
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Load the plugin that provides the "connect" task.
  grunt.loadNpmTasks('grunt-contrib-connect');

  // Load the plugin that provides the "jshint" task.
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  
  // load the plugin that provides the "ng-annotate" task.
  grunt.loadNpmTasks('grunt-ng-annotate');

  grunt.loadNpmTasks('grunt-angular-templatecache');

  // Default task(s).
  grunt.registerTask('default', 'watch files and start livereload server', ['jshint', 'build:dev', 'connect', 'watch']);
  
  grunt.registerTask('build:dev', 'build src into dist folder (unminified)', ['angularTemplateCache', 'concat']);
  grunt.registerTask('build', 'build src into dist folder', ['angularTemplateCache', 'concat', 'ngAnnotate', 'uglify']);

};