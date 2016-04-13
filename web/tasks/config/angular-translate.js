module.exports = function(grunt) {

	grunt.config.set('i18nextract', {
		default_options: {
			// src: ['assets/js/**/*.js', 'assets/templates/**/*.html'],
			src: [],
			lang: ['en', 'fr', 'es', 'ru', 'hi', 'zh', 'de'],
			dest: 'assets/i18n',
			suffix: '.json',
			jsonSrc: 'assets/i18n/variab.json',
			jsonName: 'label',
			safeMode: false
		}
	});

	grunt.loadNpmTasks('grunt-angular-translate');
};
