var SmartApp = angular.module('SmartApp', ['ngRoute', 'ui.bootstrap', 'ui.bootstrap.tpls', 'angular-loading-bar', 'pascalprecht.translate', 'ngSanitize', 'googlechart', 'LocalStorageModule']);


/* Config */

// routes
SmartApp.config(['$routeProvider',
	function($routeProvider) {
		$routeProvider.when('/', {
			templateUrl: '/templates/home.html',
			controller: 'HomeController'
		}).when('/point/:id', {
			templateUrl: '/templates/point.html',
			controller: 'PointController'
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
SmartApp.config(['$translateProvider', 'paramsCnst', function($translateProvider, paramsCnst) {
	var availables = {};
	for (var i in paramsCnst.languages) {
		availables[paramsCnst.languages[i] + '_*'] = paramsCnst.languages[i];
	}
	var preferred_language = 'en';
	if (window.navigator.languages && window.navigator.languages[0]) {
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
		.registerAvailableLanguageKeys(paramsCnst.languages, availables)
		.fallbackLanguage('en');
}]);

// local storage
SmartApp.config(['localStorageServiceProvider', function(localStorageServiceProvider) {
	localStorageServiceProvider.setPrefix('LyonEye');
}]);

/* --Config-- */


/* Constants */

SmartApp.constant('colorsCnst', ['red', 'orange', 'yellow', 'lgreen', 'green']);
SmartApp.constant('colorsTextCnst', ['#015154', '#061761', '#5D0A40', '#310572', '#ddffff']);
SmartApp.constant('paramsCnst', {
	initial_zoom: 12,
	initial_latlng: { // lat long of lyon
		lat: 45.7591739,
		lng: 4.8846752
	},
	limit_points: 300, // limit to load from server each time
	original_language: 'fr',
	languages: ['en', 'fr', 'es', 'ru', 'hi', 'zh', 'de'], // available languages
	opt_markers_clusters: { // options for markers clusterer
		gridSize: 43,
		minimumClusterSize: 2,
		maxZoom: 16,
		zoomOnClick: false,
	}
});

/* --Constants-- */
