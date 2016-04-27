var SmartApp = angular.module('SmartApp', ['ngRoute', 'ui.bootstrap', 'ui.bootstrap.tpls', 'angular-loading-bar', 'pascalprecht.translate', 'ngSanitize', 'googlechart']);


/* Config */

// routes
SmartApp.config(['$routeProvider',
	function($routeProvider) {
		$routeProvider.when('/', {
			templateUrl: '/templates/home.html',
			controller: 'MainCtrl'
		}).when('/point/:id', {
			templateUrl: '/templates/point.html',
			controller: 'PointCtrl'
		}).otherwise({
			redirectTo: '/'
		});
	}
]);

// loading bar
SmartApp.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
	cfpLoadingBarProvider.includeSpinner = false;
	// cfpLoadingBarProvider.parentSelector = '#loader';
	// cfpLoadingBarProvider.spinnerTemplate = '<div>loading...</div>';
}]);

// translation
SmartApp.config(['$translateProvider', 'languagesCnst', function($translateProvider, languagesCnst) {
	var availables = {};
	for (var i in languagesCnst) {
		availables[languagesCnst[i] + '_*'] = languagesCnst[i];
	}
	var preferred_language = 'en';
	if (window.navigator.languages[0]) {
		preferred_language = window.navigator.languages[0];
	} else if (window.navigator.language) {
		preferred_language = window.navigator.language;
	} else if (window.navigator.browserLanguage) {
		preferred_language = window.navigator.browserLanguage;
	} else if (window.navigator.systemLanguage) {
		preferred_language = window.navigator.systemLanguage;
	} else if (window.navigator.userLanguage) {
		preferred_language = window.navigator.userLanguage;
	}
	$translateProvider
		.useSanitizeValueStrategy('sanitizeParameters')
		// .useStaticFilesLoader({
		// 	prefix: '/i18n/',
		// 	suffix: '.json'
		// })
		.useUrlLoader('/translations/getTranslations')
		.preferredLanguage(preferred_language.substring(0, 2))
		.registerAvailableLanguageKeys(languagesCnst, availables)
		.fallbackLanguage('en');
}]);

/* --Config-- */


/* Constants */

SmartApp.constant('colorsCnst', ['red', 'orange', 'yellow', 'lgreen', 'green']);
SmartApp.constant('languagesCnst', ['en', 'fr', 'es', 'ru', 'hi', 'zh', 'de']);

/* --Constants-- */
