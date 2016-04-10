module.exports = function(grunt) {

	grunt.config.set('i18nextract', {
		default_options: {
			src: ['assets/js/**/*.js', 'assets/templates/**/*.html'],
			lang: ['en', 'fr', 'es', 'ru', 'hi'],
			dest: 'assets/i18n',
			suffix: '.json',
			jsonSrc: 'assets/i18n/variab.json',
			jsonName: 'label'
		}
	});

	grunt.loadNpmTasks('grunt-angular-translate');
};
