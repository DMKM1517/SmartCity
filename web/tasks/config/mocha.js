module.exports = function(grunt) {

  grunt.config.set('mochaTest', {
    test: {
      options: {
        reporter: 'list',
        require: 'tests/coverage/blanket'
      },
      src: ['tests/bootstrap.test.js', 'tests/sails/**/*.test.js']
    },
    coverage: {
      options: {
        reporter: 'html-cov',
        // use the quiet flag to suppress the mocha console output
        quiet: true,
        // specify a destination file to capture the mocha
        // output (the quiet option does not suppress this)
        captureFile: 'tests/coverage/server.html'
      },
      src: ['tests/bootstrap.test.js', 'tests/sails/**/*.test.js']
    }
  });

  grunt.loadNpmTasks('grunt-mocha-test');

};
