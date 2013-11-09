'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    jshint: {
      all: [
        'Gruntfile.js',
        'lib/**/*.js',
        'test/*.js'
      ],
      options: {
        jshintrc: '.jshintrc',
      },
    },

    clean: {
      tests: ['build'],
    },

    connect: {
      server: {
        options: {
          port: 3000,
          base: '',
          livereload: 35730,
          open: 'http://localhost:3000/test'
        }
      }
    },

    shell: {
      build: {
        command: 'component build --dev',
        options: {
          stdout: true
        }
      }
    },

    watch: {
      options: {
        livereload: 35730,
        spawn: false
      },
      js: {
        files: ['lib/**/*.js', 'test/index.js'],
        tasks: ['shell:build']
      }
    }

  });

  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', [
    'clean',
    'shell:build'
  ]);

  grunt.registerTask('dev', [
    'default',
    'connect',
    'watch'
  ]);

};