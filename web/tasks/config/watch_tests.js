module.exports = function(grunt) {

  grunt.config.set('watch_tests', {
    assets: {

      // Assets to watch:
      files: ['assets/**/*', '!**/node_modules/**'],

      // When assets are changed:
      tasks: ['jasmine' ]
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
};