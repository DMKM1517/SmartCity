var SmartApp = angular.module('SmartApp', ['ngRoute', 'ui.bootstrap', 'ui.bootstrap.tpls', 'angular-loading-bar', 'pascalprecht.translate', 'ngSanitize']);


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
	cfpLoadingBarProvider.parentSelector = '#loader';
	cfpLoadingBarProvider.spinnerTemplate = '<div>loading...</div>';
}]);

// translation
SmartApp.config(['$translateProvider', 'languagesCnst', function($translateProvider, languagesCnst) {
	var availables = {};
	for (var i in languagesCnst) {
		availables[languagesCnst[i] + '_*'] = languagesCnst[i];
	}
	$translateProvider
		.useSanitizeValueStrategy('sanitizeParameters')
		.useStaticFilesLoader({
			prefix: '/i18n/',
			suffix: '.json'
		})
		.registerAvailableLanguageKeys(languagesCnst, availables)
		.determinePreferredLanguage()
		.fallbackLanguage('en');
	// $translateProvider.preferredLanguage('en');
}]);

/* --Config-- */


/* Constants */

SmartApp.constant('colorsCnst', ['red', 'orange', 'yellow', 'lgreen', 'green']);
SmartApp.constant('languagesCnst', ['en', 'fr', 'es', 'ru', 'hi']);

/* --Constants-- */
