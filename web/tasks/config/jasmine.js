module.exports = function(grunt) {

  grunt.config.set('jasmine', {
    angular: {
      src: 'assets/js/*.js',
      options: {
        specs: 'spec/angular/*spec.js',
        vendor: [
          'assets/bower_components/angular/angular.js',
          'assets/bower_components/angular-route/angular-route.js',
          'assets/bower_components/angular-mocks/angular-mocks.js'
        ],
        keepRunner: true,
        // "display": "short",
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jasmine');
};
