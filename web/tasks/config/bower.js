/**
 * Task to pull out specific files from bower packages.
 * If we don't do this, Sails will copy ALL the bower package files to the .tmp directory
 */
module.exports = function(grunt) {
	grunt.config.set('bower', {
		noclean: {
			options: {
				targetDir: './assets/bower',
				layout: 'byComponent',
				install: false,
				cleanTargetDir: false,
				cleanBowerDir: false
			}
		},
		clean: {
			options: {
				targetDir: './assets/bower',
				layout: 'byComponent',
				install: false,
				cleanTargetDir: true,
				cleanBowerDir: false
			}
		},
		install: {
			options: {
				targetDir: './assets/bower',
				layout: 'byComponent',
				install: true,
				cleanTargetDir: true,
				cleanBowerDir: false
			}
		}
	});

	grunt.loadNpmTasks('grunt-bower-task');
};