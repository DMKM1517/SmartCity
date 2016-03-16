module.exports = function(grunt) {

  grunt.config.set('karma', {
    karma: {
      configFile: 'tests/karma.conf.js'
    }
  });

  grunt.loadNpmTasks('grunt-karma');
};