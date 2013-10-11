'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    jshint: {
      all: [
        'Gruntfile.js',
        'lib/*.js',
        'test/*.js'
      ],
      options: {
        jshintrc: '.jshintrc',
      },
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['build'],
    },

    mocha: {
      all: {
        src: [ 'test/index.html' ]
      },
      options: {
        run: true,
        bail: true,
        reporter: 'Spec',
        mocha: {
          ignoreLeaks: false
        },
      }
    },

  });


  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-mocha');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.registerTask('default', ['jshint']);

};
