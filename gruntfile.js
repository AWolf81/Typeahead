// Gruntfile.js

module.exports = function(grunt) {
  // load all grunt plugins (every task that start's with 'grunt-')
  require('load-grunt-tasks')(grunt);

  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-istanbul-coverage');

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    dirs: {
        output: 'dist', // path to build folder
    },
    sourceFiles: {
      js: [
        'src/common/**/*.js', // common scripts (utils and shared methods)
        'src/components/typeahead/*.module.js', // modules first
        'src/components/typeahead/*.js',

        'src/components/**/*.js', // load other source files (order doesn't matter)
        '<%=angularTemplateCache.newModule.dest %>',
        '!src/**/*.spec.js'
      ]
    },
    karma: {  
      unit: {
        options: {
          frameworks: ['jasmine'],
          singleRun: true,
          browsers: ['PhantomJS'],
          files: [
            'bower_components/angular/angular.js',
            'bower_components/angular-mocks/angular-mocks.js',
            '<%=sourceFiles.js %>' //'src/**/*.js'
          ]
        }
      }
    },

    coverage: {
      default: {
        options: {
          thresholds: {
            'statements': 90,
            'branches': 90,
            'lines': 90,
            'functions': 90
          },
          dir: 'coverage',
          root: 'test'
        }
      }
    },

    clean: {
      build: {
        build: ['dist'],
        tmp: ['tmp'],
      },
      test: {
        coverage: ['coverage']
      }
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
            src: '<%=sourceFiles.js %>',
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

  // Default task(s).
  grunt.registerTask('default', 'watch files and start livereload server', ['jshint', 'build:dev', 'connect', 'watch']);
  
  grunt.registerTask('build:dev', 'build src into dist folder (unminified)', ['angularTemplateCache', 'concat']);
  grunt.registerTask('build', 
    'build src into dist folder', 
    ['clean:build', 'angularTemplateCache', 'concat', 'ngAnnotate', 'uglify']
  );
  grunt.registerTask('test', 'Run unit tests (single run)', ['jshint', 'karma']);
  // grunt.registerTask('test:coverage', 'Run test coverage report (Istanbul)', ['coverage']);


};